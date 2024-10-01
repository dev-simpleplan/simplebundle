import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { SHOP_LOCALES } from "../api/SHOP_LOCALES";
import i18next from "../i18n";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const shopInfo = await admin.graphql(SHOP_LOCALES);
  const shopInfoFinal = await shopInfo.json();
  const lang = shopInfoFinal.data.shopLocales.find(locale => locale.primary)?.locale || 'en';
  console.log("This is the shop info", lang);
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "", language: lang });
};

export default function App() {
  const { apiKey, language } = useLoaderData();
  i18next.changeLanguage(language);


  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Home</Link>
        <Link to="/app/create-bundle">Create Fixed Bundle</Link>
        <Link to="/app/create-bundle2">Create Infinite Bundle</Link>
        <Link to="/app/analytics">Analytics</Link>
        <Link to="/app/resources">Resources</Link>
        </NavMenu>
      <Outlet />

    </AppProvider>
  );
}
// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};