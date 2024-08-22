import React from 'react';
import { Banner } from "@shopify/polaris";

export function RequestFeature({ showBanner, setShowBanner }) {
  if (!showBanner) return null;

  return (
    <Banner
      title="Help us improve our services"
      action={{content: 'Request a feature', url: '#'}}
      onDismiss={() => setShowBanner(false)}
    >
      <p>We prioritize new features based on user feedback. Your input shapes our roadmap!</p>
    </Banner>
  );
}