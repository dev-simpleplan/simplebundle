import React, { useEffect, useMemo } from "react";
import {
  useLoaderData,
  useFetcher,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useAppBridge } from "@shopify/app-bridge-react";
// import { fetchBundle } from "../fetch-bundle.server";
import { DashboardUI } from "../components/Dashboard";
import Onboarding from "../components/Onboard";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { UPDATE_PRODUCT_MUTATION } from "../api/UPDATE_PRODUCT_MUTATION";
import { DELETE_PRODUCT_MUTATION } from "../api/DELETE_PRODUCT_MUTATION";
import { handleGraphQLResponse } from "../utils/sharedUtils";
import { Spinner } from "@shopify/polaris";
import { REGISTER } from "../api/REGISTER";
import { QUERY } from "../api/QUERY";
import { fetchShopInfo } from "../fetchShopInfo.server";
import {
  sendSupportSlackNotification,
  sendSlackNotification,
} from "../sendSlackNotification.server";
import {
  checkFirstInstall,
  createShopInstallation,
  createShopifyStore,
} from "../shopInstallation.server";
import i18next from "i18next";

export async function loader({ request }) {
  const { session, admin } = await authenticate.admin(request);

  const sessionData = await prisma.session.findUnique({
    where: { id: session.id },
  });

  const shopData = await fetchShopInfo(request);

  const isFirstInstall = await checkFirstInstall(shopData.data.shop.url);

  if (isFirstInstall) {
    // Fetch shop data
    if (!shopData || !shopData.data) {
      return json(
        { error: "Failed to fetch shop data. Please try again later" },
        { status: 500 },
      );
    }

    // Create new installation record
    const installation = await createShopInstallation(shopData.data.shop.url);

    // Create new store record
    const storeData = await createShopifyStore(shopData, installation.id);

    // Send Slack notification
    await sendSlackNotification(storeData);
    
  }
   const query = await admin.graphql(QUERY);
    const queryResponse = await query.json();
      const functionId = queryResponse.data.shopifyFunctions.edges.find(edge => edge.node.title === "bundle").node;
      const response = await admin.graphql(REGISTER(functionId.id));
     const jsonResponse = await response.json(); 
    console.log("This is the error",jsonResponse.data.cartTransformCreate.userErrors);
     console.log("This is the response",jsonResponse);
  

 // Await the JSON response
  

  const bundleFromDb = await prisma.bundle.findMany({
    where: {
      userId: session.id,
    },
  });

  // const data = await fetchBundle(request);
  const data = bundleFromDb;
  return json({ products: data, session: sessionData });
}

async function updateProductStatus(admin, productId, newStatus) {
  const response = await admin.graphql(UPDATE_PRODUCT_MUTATION, {
    variables: {
      input: {
        id: productId,
        status: newStatus.toUpperCase(),
      },
    },
  });

  await handleGraphQLResponse(response, "Error updating product details");
}

async function deleteProduct(admin, productId, productIdInDB) {
  const bundleID = parseInt(productIdInDB);
  const response = await admin.graphql(DELETE_PRODUCT_MUTATION, {
    variables: {
      input: {
        id: productId,
      },
    },
  });

  const deleteBundle = await prisma.bundle.delete({
    where: { id: bundleID },
  });

  await handleGraphQLResponse(response, "Error deleting product");
}

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "submitSupportRequest") {
    try {
      const email = formData.get("email");
      const message = formData.get("message");
      const requestType = formData.get("requestType");
      const timestamp = new Date().toISOString();
      const shopDomain = session.shop;

      if (!email || !message || !requestType) {
        return json(
          { success: false, error: "Missing required fields" },
          { status: 400 },
        );
      }

      const result = await sendSupportSlackNotification({
        email,
        message,
        requestType,
        timestamp,
        shopDomain,
      });

      if (result.ok) {
        return json({
          success: true,
          message: "Support request submitted successfully",
        });
      } else {
        return json({ success: false, error: result.error }, { status: 500 });
      }
    } catch (error) {
      return json(
        { success: false, error: "Failed to submit support request" },
        { status: 500 },
      );
    }
  }

  if (action === "updateOnboarding") {
    try {
      await prisma.session.update({
        where: { id: session.id },
        data: { onboarding: true },
      });
      return redirect("/app/create-bundle");
    } catch (error) {
      return json(
        { success: false, error: "Failed to update onboarding status" },
        { status: 500 },
      );
    }
  }

  if (action === "updateProductStatus") {
    const productId = formData.get("productId");
    const newStatus = formData.get("newStatus");

    try {
      await updateProductStatus(admin, productId, newStatus);
      return json({ success: true });
    } catch (error) {
      return json(
        { success: false, error: "Failed to update product status" },
        { status: 500 },
      );
    }
  }

  if (action === "deleteProduct") {
    const productId = formData.get("productId");
    const productIdInDB = formData.get("productIdInDB");

    try {
      await deleteProduct(admin, productId, productIdInDB);
      return json({ success: true });
    } catch (error) {
      return json(
        { success: false, error: "Failed to delete product" },
        { status: 500 },
      );
    }
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
}

export default function Dashboard() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const app = useAppBridge();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const products = useMemo(() => {
    return data.products || [];
  }, [data]);

  const handleStatusChange = (productId, newStatus) => {
    fetcher.submit(
      { action: "updateProductStatus", productId, newStatus },
      { method: "post" },
    );
  };

  const handleDeleteProduct = (productId, productIdInDB) => {
    fetcher.submit(
      { action: "deleteProduct", productId, productIdInDB },
      { method: "post" },
    );
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        app.toast.show("Operation completed successfully");
      } else if (fetcher.data.error) {
        app.toast.show(fetcher.data.error, { isError: true });
      }
    }
  }, [fetcher.data, app]);

  if (navigation.state === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spinner accessibilityLabel="Loading" size="large" />
      </div>
    );
  }

  if (data.session?.onboarding) {
    return (
      <>
      <DashboardUI
        products={products}
        onStatusChange={handleStatusChange}
        onDeleteProduct={handleDeleteProduct}
        fetcher={fetcher}
        navigate={navigate}
        i18 ={i18next}
      />
      <script src="//code.tidio.co/oma6jmieabziumphilootw8fmtsdorad.js" async></script>
        </>
    );
  }

  return <Onboarding i18={i18next} />;
}
