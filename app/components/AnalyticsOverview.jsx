import React from "react";
import {
  Card,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Tooltip,
  Icon,
} from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";
function InfoTooltip({ content }) {
  return (
    <Tooltip content={content}>
        <Icon source={InfoIcon} color="subdued" />
    </Tooltip>
  );
}
export function AnalyticsOverview({ currency,totalBundles, activeBundles, draftBundles, i18 }) {
  return (
    <BlockStack gap="400">
      <Text variant="headingLg" as="h2">
         {i18.t("bundleHead")}
      </Text>
      <InlineStack wrap={false} align="start" gap="500">
        <Card>
          <Box padding="150">
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h3">
                  {i18.t("bundleCardHead2")}
                </Text>
                <InfoTooltip content={i18.t("revenueTotalTooltip")} />
              </InlineStack>
              <Text variant="heading2xl" as="p">
              {totalBundles}  <span style={{fontSize:'0.6em'}}>{currency}</span>
              </Text>
            </BlockStack>
          </Box>
        </Card>
        <Card>
          <Box padding="150">
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h3">
                  {i18.t("bundleCardHead3")}
                </Text>
                <InfoTooltip content={i18.t("ordersTotalTooltip")} />
              </InlineStack>
              <Text variant="heading2xl" as="p">
                {activeBundles}
              </Text>
            </BlockStack>
          </Box>
        </Card>
        <Card>
          <Box padding="150">
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h3">
                 {i18.t("avgHead")}
                </Text>
                <InfoTooltip content={i18.t("aovToolTip")} />
              </InlineStack>
              <Text variant="heading2xl" as="p">
                 {draftBundles} <span style={{fontSize:'0.6em'}}>{currency}</span>
              </Text>
            </BlockStack>
          </Box>
        </Card>
      </InlineStack>
    </BlockStack>
  );
}