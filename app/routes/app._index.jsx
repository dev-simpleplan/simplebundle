import React, { useEffect, useMemo } from "react";
import { useLoaderData, useFetcher, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useAppBridge } from "@shopify/app-bridge-react";
import { fetchBundle } from "../fetch-bundle.server";
import { DashboardUI } from "../components/Dashboard";
import Onboarding from "../components/Onboard";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { UPDATE_PRODUCT_MUTATION } from "../api/UPDATE_PRODUCT_MUTATION";
import { DELETE_PRODUCT_MUTATION } from "../api/DELETE_PRODUCT_MUTATION";
import { handleGraphQLResponse } from "../utils/sharedUtils";
import { fetchShopInfo } from '../fetchShopInfo.server';

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const sessionData = await prisma.session.findUnique({
    where: { id: session.id }
  });
  const analytics = await prisma.analytics.findFirst({
    where: { userId: session.id }
  });
  const dataAnalytics = await fetchShopInfo(request);
  const currency =  dataAnalytics.data.shop.currencyCode

  const data = await fetchBundle(request);
  data.session = sessionData;
  // return json(data);
  return json({
    data: data,
    analytics: analytics || { revenue: '0', orders: '0', currency: currency },
    currency: currency
    
  });
}

async function updateProductStatus(admin, productId, newStatus) {
  const response = await admin.graphql(UPDATE_PRODUCT_MUTATION, {
    variables: {
      input: {
        id: productId,
        status: newStatus.toUpperCase()
      }
    }
  });

  await handleGraphQLResponse(response, "Error updating product details");
}

async function deleteProduct(admin, productId) {
  const response = await admin.graphql(DELETE_PRODUCT_MUTATION, {
    variables: {
      input: {
        id: productId
      }
    }
  });

  await handleGraphQLResponse(response, "Error deleting product");
}

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "updateOnboarding") {
    try {
      await prisma.session.update({
        where: { id: session.id },
        data: { onboarding: true },
      });
      return redirect("/app/create-bundle");
    } catch (error) {
      console.error("Failed to update onboarding status:", error);
      return json({ success: false, error: "Failed to update onboarding status" }, { status: 500 });
    }
  }

  if (action === "updateProductStatus") {
    const productId = formData.get("productId");
    const newStatus = formData.get("newStatus");

    try {
      await updateProductStatus(admin, productId, newStatus);      
      return json({ success: true });
    } catch (error) {
      return json({ success: false, error: "Failed to update product status" }, { status: 500 });
    }
  }

  if (action === "deleteProduct") {
    const productId = formData.get("productId");
    try {
      await deleteProduct(admin, productId);
      return json({ success: true });
    } catch (error) {
      return json({ success: false, error: "Failed to delete product" }, { status: 500 });
    }
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
}

export default function Dashboard() {
  const {data, analytics, currency} = useLoaderData();
  const fetcher = useFetcher();
  const app = useAppBridge();
  const navigation = useNavigation();

  const products = useMemo(() => {
    return data?.data?.products?.edges || [];
  }, [data]);

  const handleStatusChange = (productId, newStatus) => {
    fetcher.submit(
      { action: "updateProductStatus", productId, newStatus },
      { method: "post" }
    );
  };

  const handleDeleteProduct = (productId) => {
    fetcher.submit(
      { action: "deleteProduct", productId },
      { method: "post" }
    );
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        app.toast.show('Operation completed successfully');
      } else if (fetcher.data.error) {
        app.toast.show(fetcher.data.error, { isError: true });
      }
    }
  }, [fetcher.data, app]);

  if (data.session?.onboarding) {
    return <DashboardUI 
      products={products} 
      onStatusChange={handleStatusChange} 
      onDeleteProduct={handleDeleteProduct}
      fetcher={fetcher}
      analytics={analytics}
      currency={currency}
      
    />;
  }

  return <Onboarding />;
}