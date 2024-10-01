import React from 'react';
import { Banner } from "@shopify/polaris";

export function SyncWarning({ showBanner, setShowBanner, i18 }) {
  if (!showBanner) return null;

  return (
    <Banner
      title={i18.t("dashboardHead2")}
      // action={{content: 'Request a feature', url: '#'}}
      onDismiss={() => setShowBanner(false)}
    >
      <p>{i18.t("dashboardRequest2")}</p>
    </Banner>
  );
}