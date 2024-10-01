import React from 'react';
import { Layout, Card, Text, BlockStack, InlineStack, Tag } from '@shopify/polaris';

const BUNDLE_LIMITS = {
  products: 30,
  options: 3,
  variants: 100
};


export default function TwoColumnLayout({ children, step, bundleLimits, formData, i18 }) {
  const stepInfo = {
    1: {
      title: i18.t("brandHead"),
      description: i18.t("brandDescription")
    },
    2: {
      title: i18.t("selectProductStockHead"),
      description: i18.t("selectProductStockDesc")
    },
    3: {
      title: i18.t("priceShowHead"),
      description: i18.t("priceShowDesc")
    },
    4: {
      title: i18.t("pitchHead"),
      description: i18.t("pitchBody"),
    },
  };
  const renderBundleLimitItem = (key, value, limit) => {
    const isExceeded = value > limit;
    const color = isExceeded ? 'critical' : 'subdued';
    
    return (
      <InlineStack gap="200" align="start">
        {isExceeded}
        <Text tone={color}>
          {value}/{limit} {key}
        </Text>
      </InlineStack>
    );
  };

  const renderProductOptions = () => {
    const productsWithOptions = formData.products.filter(product => 
      product.options.some(option => 
        option.name !== 'Title' && option.values.length > 1
      )
    );

    if (productsWithOptions.length === 0) {
      return <Text>{i18.t("customization1")}</Text>;
    }

    return productsWithOptions.map((product) => (
      <BlockStack key={product?.id} gap="200">
        <Text variant="headingSm" as="h4">{product?.title}</Text>
        {product?.options
          .filter(option => option.name !== 'Title' && option.values.length > 1)
          .map((option) => (
            <BlockStack key={option.id} gap="100">
              <Text variant="bodySm">{option.name}</Text>
              <InlineStack gap="200" wrap>
                {option.values.filter(v => v.selected).map((value) => (
                  <Tag key={value.value}>{value.value}</Tag>
                ))}
              </InlineStack>
            </BlockStack>
          ))
        }
      </BlockStack>
    ));
  };

  return (
    <Layout>
      <Layout.Section>
        {children}
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">{stepInfo[step].title}</Text>
              <Text>{stepInfo[step].description}</Text>
            </BlockStack>
          </Card>
          {step === 2 && bundleLimits && (
            <>
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h3">{i18.t("bundleLimitsHead")}</Text>
                  <BlockStack gap="200">
                    {renderBundleLimitItem(i18.t("bundleLimitsHead"), bundleLimits.products, BUNDLE_LIMITS.products)}
                    {renderBundleLimitItem(i18.t("bundleLimitsProds"), bundleLimits.options, BUNDLE_LIMITS.options)}
                    {renderBundleLimitItem(i18.t("bundleLimitsVariants"), bundleLimits.variants, BUNDLE_LIMITS.variants)}
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h3">{i18.t("customizationHead")}</Text>
                  <Text>{i18.t("customizationDesc")}</Text>
                  {renderProductOptions()}
                </BlockStack>
              </Card>
            </>
          )} 
        </BlockStack>
      </Layout.Section>
    </Layout>
  );
}
