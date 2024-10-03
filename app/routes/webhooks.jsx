import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  failedUninstallNotification,
  sendUninstallNotification,
} from "../sendSlackNotification.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);

  if (!admin) {
    throw new Response();
  }

  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
  switch (topic) {
    case "PRODUCTS_UPDATE":
      const allBundles = await db.session.findUnique({
        where: {
          id: session.id,
        },
        include: {
          bundles: true,
        },
      });
      const updatedProductId = payload.admin_graphql_api_id;

      for (const bundle of allBundles.bundles) {
        const bundleProducts = bundle.products;
        const bundleProduct = bundleProducts.find(
          (product) => product.id === updatedProductId,
        );

        if (bundleProduct) {
          for (const payloadVariant of payload.variants) {
            const bundleVariant = bundleProduct.variants.find(
              (v) => v.id === payloadVariant.admin_graphql_api_id,
            );

            if (bundleVariant) {
              if (
                payloadVariant.price !== bundleVariant.price ||
                payloadVariant.compare_at_price !== bundleVariant.compareAtPrice
              ) {
                bundleVariant.price = payloadVariant.price;
                bundleVariant.compareAtPrice = payloadVariant.compare_at_price;
                const productIndex = bundleProducts.findIndex(
                  (product) => product.id === updatedProductId,
                );
                const variantIndex = bundleProducts[
                  productIndex
                ].variants.findIndex((v) => v.id === payloadVariant.id);
                bundleProducts[productIndex].variants[variantIndex] =
                  bundleVariant;
                try {
                  await db.bundle.update({
                    where: { id: bundle.id },
                    data: {
                      products: bundleProducts,
                    },
                  });
                } catch (error) {
                  console.error(
                    `Error updating bundle ${bundle.bundleName}:`,
                    error,
                  );
                }
              }
            }
          }
        } else {
          console.log("This product is not part of any bundle");
        }
      }
      break;
    case "ORDERS_CREATE":
      const subtotalPrice = payload.subtotal_price;
      const currency = payload.currency;

      try {
        // Fetch the current Analytics record for the user
        const currentAnalytics = await db.analytics.findFirst({
          where: { userId: session.id },
        });

        if (currentAnalytics) {
          // If an Analytics record exists, update it
          const updatedRevenue = (
            parseFloat(currentAnalytics.revenue) + parseFloat(subtotalPrice)
          ).toString();
          const updatedOrders = (
            parseInt(currentAnalytics.orders) + 1
          ).toString();

          await db.analytics.update({
            where: { id: currentAnalytics.id },
            data: {
              revenue: updatedRevenue,
              orders: updatedOrders,
              currency: currency,
            },
          });

          console.log(
            `Updated Analytics: Revenue: ${updatedRevenue} ${currency}, Orders: ${updatedOrders}`,
          );
        } else {
          // If no Analytics record exists, create a new one
          await db.analytics.create({
            data: {
              revenue: subtotalPrice.toString(),
              orders: "1",
              userId: session.id,
            },
          });

          console.log(
            `Created new Analytics: Revenue: ${subtotalPrice} ${currency}, Orders: 1`,
          );
        }
      } catch (error) {
        console.error("Error updating Analytics:", error);
      }

      break;
    case "PRODUCTS_DELETE":
      const deleteProductId = `gid://shopify/Product/${payload.id}`;
      try {
        const sessionWithBundles = await db.session.findUnique({
          where: {
            id: session.id,
          },
          include: {
            bundles: true,
          },
        });

        if (!sessionWithBundles) {
          console.log("Session not found");
          return;
        }
        const matchingBundle = sessionWithBundles.bundles.find(
          (bundle) => bundle.ProductBundleId === deleteProductId,
        );

        if (matchingBundle) {
          await db.bundle.delete({
            where: {
              id: matchingBundle.id,
            },
          });
        } else {
          console.log(`Product with ID ${deleteProductId} is not a bundle.`);
        }
      } catch (error) {
        console.error("Error handling bundle deletion:", error);
      }
      break;
    case "APP_UNINSTALLED":
      if (session) {
        const { shop } = session;
        let deletedStoreInfo = null;
        const shop_url = `https://${shop}`;

        try {
          // Start a transaction
          await db.$transaction(async (prisma) => {
            // Delete all Bundles associated with this session
            await prisma.bundle.deleteMany({
              where: { userId: session.id },
            });

            // Delete all Analytics associated with this session
            await prisma.analytics.deleteMany({
              where: { userId: session.id },
            });

            // Delete the session
            await prisma.session.delete({
              where: {
                id: session.id,
              },
            });

            // Fetch the ShopifyStore information before deletion
            deletedStoreInfo = await prisma.shopifyStore.findUnique({
              where: { shop: shop_url },
            });

            // Delete the ShopifyStore
            if (deletedStoreInfo) {
              await prisma.shopifyStore.delete({
                where: { shop: shop_url },
              });
            }

            // Delete the ShopInstallation
            await prisma.shopInstallation.delete({
              where: { shop: shop_url },
            });
          });

          console.log(`Uninstallation completed for shop: ${shop_url}`);

          sendUninstallNotification(deletedStoreInfo);
        } catch (error) {
          console.error(
            `Error during uninstallation for shop ${shop_url}:`,
            error,
          );
          await failedUninstallNotification(shop_url, error);
        }
      } else {
        console.log("No session found for uninstallation");
      }

      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
