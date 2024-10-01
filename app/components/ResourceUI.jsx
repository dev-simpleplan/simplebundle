import React from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  Button, 
  BlockStack,
  InlineStack,
  Icon,
  Box,
  Link
} from '@shopify/polaris';
import { ExternalIcon } from '@shopify/polaris-icons';
import { SupportModal } from './SupportModal';

export default function ResourceUI({ 
  onSupportSubmit, 
  formErrors, 
  isSubmitting,
  isModalOpen,
  onModalOpen,
  onModalClose,
  shouldResetForm,
  i18

}) {
   const quickStartSteps = [
    { text: i18.t("onboardStep1"), url: 'https://www.youtube.com/watch?v=ot0m0MN8eI8' },
    { text: i18.t("onboardStep2"), url: 'https://www.youtube.com/watch?v=KXYQKAMJ71s' }, 
    { text: i18.t("onboardStep3"), url: 'https://www.youtube.com/watch?v=WilM3zxng2A' },
    { text: i18.t("onboardStep4"), url: 'https://www.youtube.com/watch?v=l9XjGqqlp8k&t=2s' },
    { text: i18.t("onboardStep5"), url: 'https://www.youtube.com/watch?v=UpzjZwsvCNc' },
  ];
  const helpfulLinks = [
    { text: i18.t("onboardHelpfulResources1"), url: 'https://www.youtube.com/watch?v=ot0m0MN8eI8' },
    { text: i18.t("onboardHelpfulResources2"), url: 'https://www.simpleplanmedia.com/faq/' },
    { text: i18.t("onboardHelpfulResources3"), url: 'https://www.simpleplanmedia.com/faq/' },
    { text: i18.t("onboardHelpfulResources4"), url: 'https://www.youtube.com/@SimpleBundle' }
    ];

  return (
    <Page title="Resources">
      <BlockStack gap="800">
        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingXl" as="h2">{i18.t("resourcesHeading")}</Text>
                <Text variant="bodyMd">{i18.t("onboardDescription")}</Text>
                
                <Box paddingBlockStart="400">
                  <BlockStack gap="300">
                    <Text variant="headingSm" as="h3">{i18.t("onboardQuickStartGuide")}</Text>
                    <BlockStack gap="300">
                      {quickStartSteps.map((step, index) => (
                        <InlineStack gap="300" align="start" blockAlign="start" key={step.text}>
                          <div style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--p-color-bg-success-strong)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Text variant="bodyMd" as="span" fontWeight="semibold" tone="success">
                              {index + 1}
                            </Text>
                          </div>
                          <Link target="_blank" url={step.url}>
                            {step.text}
                          </Link>
                        </InlineStack>
                      ))}
                    </BlockStack>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h3">{i18.t("onboardHelpfulResources")}</Text>
                <BlockStack gap="300">
                  {helpfulLinks.map((link) => (
                    <InlineStack key={link.url} gap="300" align="start" blockAlign="start">
                      <div style={{ flexShrink: 0 }}>
                        <Icon source={ExternalIcon} />
                      </div>
                      <Link target="_blank" url={link.url} external>
                        {link.text}
                      </Link>
                    </InlineStack>
                  ))}
                </BlockStack>
                <Box paddingBlockStart="400">
                  <Text variant="headingSm">{i18.t("onboardNeedHelp")}</Text>
                  <Text variant="bodyMd">{i18.t("resourceContactBody")}</Text>
                </Box>
                <Box paddingBlockStart="200">
                  <Button variant='primary' onClick={onModalOpen}>
                    {i18.t("resourceContactBtn")}
                  </Button>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <SupportModal 
  open={isModalOpen} 
  onClose={onModalClose} 
  onSubmit={onSupportSubmit}
  isSubmitting={isSubmitting}
  formErrors={formErrors}
  shouldResetForm={shouldResetForm}
  i18={i18}
/>
    </Page>
  );
}
