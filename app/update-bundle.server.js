import { authenticate } from "./shopify.server";
import { UPDATE_PRODUCT_BUNDLE_MUTATION } from './api/UPDATE_BUNDLE';
import { PRODUCT_VARIANTS_BULK_UPDATE_MUTATION } from "./api/PRODUCT_VARIANTS_BULK_UPDATE_MUTATION";
import { JOB_POLLER_QUERY } from "./api/JOB_POLLER_QUERY";
import { handleGraphQLResponse, calculateDiscountedPrice, pollJobStatus } from "./utils/sharedUtils";
import prisma from "./db.server";

export async function updateBundle(request, formData) {
  const { admin } = await authenticate.admin(request);
  const updateBundleData = JSON.parse(formData.get('formData'));

  try {
    const bundle = await prisma.bundle.findFirst({
      where: {
        id: updateBundleData.idInDb,
      }
    });

    if (!bundle) {
      throw new Error("Bundle not found");
    }

    await updateBundleInDatabase(updateBundleData);

    const updateProductResponse = await admin.graphql(UPDATE_PRODUCT_BUNDLE_MUTATION, {
      variables: {
        "input": {
          "productId": updateBundleData.id,
          "components": updateBundleData.products.map((product) => ({
            "quantity": product.quantity,
            "productId": product.id,
            "optionSelections": product.options.map((option) => ({
              "componentOptionId": option.id,
              "name":  `${option.name}`,
              "values": option.values
            }))
          }))
        }
      }
    });

    const updatedProductBundleData = await handleGraphQLResponse(updateProductResponse, "Error updating product bundle");

    // Poll for job completion
    const pollData = await pollJobStatus(admin, updatedProductBundleData.productBundleUpdate.productBundleOperation.id, {
      jobPollerQuery: JOB_POLLER_QUERY,
      onComplete: (operation) => operation,
    });

    // Extract variants from poll data
    const variants = pollData.product.variants.edges.map(edge => edge.node);

    // Calculate price change
    const oldProducts = JSON.parse(bundle.products);
    const priceChange = calculatePriceChange(oldProducts, updateBundleData.products);

    // Update variant prices
    const updatedVariants = variants.map(variant => {
      const oldCompareAtPrice = parseFloat(variant.compareAtPrice || variant.price);
      const newCompareAtPrice = oldCompareAtPrice + priceChange;
      
      // Check if there's no discount
      const noDiscount = updateBundleData.noDiscount || (!updateBundleData.discountType && !updateBundleData.discountValue);
      
      return {
        id: variant.id,
        compareAtPrice: newCompareAtPrice.toFixed(2),
        price: noDiscount 
          ? newCompareAtPrice.toFixed(2)
          : calculateDiscountedPrice(
              newCompareAtPrice,
              updateBundleData.discountType,
              parseFloat(updateBundleData.discountValue)
            ).toFixed(2)
      };
    });

    const updateVariantsResponse = await admin.graphql(PRODUCT_VARIANTS_BULK_UPDATE_MUTATION, {
      variables: {
        productId: updateBundleData.id,
        variants: updatedVariants
      }
    });

    await handleGraphQLResponse(updateVariantsResponse, "Error updating variant prices");

    // Update variants and products in database
    await prisma.bundle.update({
      where: { id: updateBundleData.idInDb },
      data: {
        variants: JSON.stringify(updatedVariants),
        products: JSON.stringify(updateBundleData.products),
        discountType: updateBundleData.noDiscount ? null : updateBundleData.discountType,
        discountValue: updateBundleData.noDiscount ? null : updateBundleData.discountValue
      }
    });

    return {
      success: true,
      message: "Bundle updated successfully",
      data: pollData,
    };
  } catch (error) {
    console.error('Error updating bundle:', error);
    return {
      success: false,
      message: error.message || "An error occurred while updating the bundle",
      error: error,
    };
  }
}

function calculatePriceChange(oldProducts, newProducts) {
  const oldProductMap = new Map(oldProducts.map(p => [p.id, p]));
  const newProductMap = new Map(newProducts.map(p => [p.id, p]));
  
  let priceChange = 0;

  // Check for removed or changed products
  oldProducts.forEach(oldProduct => {
    const newProduct = newProductMap.get(oldProduct.id);
    if (!newProduct) {
      // Product was removed
      priceChange -= getProductPrice(oldProduct) * oldProduct.quantity;
    } else if (oldProduct.quantity !== newProduct.quantity) {
      // Quantity changed
      priceChange += (newProduct.quantity - oldProduct.quantity) * getProductPrice(oldProduct);
    }
  });

  // Check for added products
  newProducts.forEach(newProduct => {
    if (!oldProductMap.has(newProduct.id)) {
      // New product added
      priceChange += getProductPrice(newProduct) * newProduct.quantity;
    }
  });

  return priceChange;
}

function getProductPrice(product) {
  if (product.variants && product.variants.length > 0) {
    return parseFloat(product.variants[0].price);
  } else if (product.price) {
    return parseFloat(product.price);
  } else {
    console.warn(`Unable to determine price for product: ${product.id}`);
    return 0;
  }
}

async function updateBundleInDatabase(updateBundleData) {
  await prisma.bundle.update({
    where: {
      id: updateBundleData.idInDb,
    },
    data: {
      discountType: updateBundleData.noDiscount ? null : updateBundleData.discountType,
      discountValue: updateBundleData.noDiscount ? null : updateBundleData.discountValue,
    }
  });
}