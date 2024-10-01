import React from 'react';
import { Banner, List } from "@shopify/polaris";
export function BundleWarningTwo({ showBanner, setShowBanner, i18 }) {
  if (!showBanner) return null;
  return (
    <Banner
      title={i18.t("informationHead")}
      status="info"
      onDismiss={() => setShowBanner(false)}
    >
      <p>{i18.t("informationNote")}</p>
      <List type="bullet">
        <List.Item>{i18.t("information1")}</List.Item>
        <List.Item>{i18.t("information2")}</List.Item>
      </List>
    </Banner>
  );
}
