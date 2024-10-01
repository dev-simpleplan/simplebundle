import {
    BlockStack,
    TextField,
    Form,
    Card,
    Text,
    Select
  } from "@shopify/polaris";

export default function InfiniteStep1({ formData, handleChange, errors, i18}) {
  return (
    <Card>
       <BlockStack gap="500">
      <Text variant="heading2xl" as="h2">
              {i18.t("createBundleHead")}
        </Text>
      <Text>
              {i18.t("createBundleDescription")}
       </Text>
    <Form method="post">
      <BlockStack gap="500">
        <TextField
          label={i18.t("createBundleLabel1")}
          value={formData.bundleName}
          onChange={handleChange("bundleName")}
          autoComplete="off"
          error={errors.bundleName}
          placeholder="e.g., 'Summer Essentials Kit'"
        />
        <Select
          label={i18.t("bundleStatusHead")}
          options={[
            { label: i18.t("bundleStatus1"), value: "active" },
            { label: i18.t("bundleStatus2"), value: "draft" }
          ]}
          value={formData.status || ""}
          onChange={handleChange("status")}
        />
      </BlockStack>
    </Form>
  </BlockStack>
  </Card>
  )
}
