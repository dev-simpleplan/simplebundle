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
  Link,
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

}) {
  const quickStartSteps = [
    { text: 'Create Your First Bundle', url: '#create-bundle' },
    { text: 'Set Pricing Strategy', url: '#pricing' },
    { text: 'Design Bundle Display', url: '#design' },
    { text: 'Test and Launch', url: '#launch' },
  ];

  const helpfulLinks = [
    { text: 'Bundle Creation Guide', url: '#create-bundles' },
    { text: 'Best Practices', url: '#best-practices' },
    { text: 'FAQs', url: '#faqs' },
    { text: 'Video Tutorials', url: '#tutorials' }
  ];

  return (
    <Page title="Resources">
      <BlockStack gap="800">
        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingXl" as="h2">Getting Started with SimpleBundle</Text>
                <Text variant="bodyMd">Supercharge your sales with our intelligent product bundling solution. Here's how to get started:</Text>
                
                <Box paddingBlockStart="400">
                  <BlockStack gap="300">
                    <Text variant="headingSm" as="h3">Quick Start Guide:</Text>
                    <BlockStack gap="300">
                      {quickStartSteps.map((step, index) => (
                        <InlineStack gap="300" align="start" blockAlign="start" key={step.text}>
                          <div style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--p-color-bg-success-strong)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Text variant="bodyMd" as="span" fontWeight="semibold" tone="success">
                              {index + 1}
                            </Text>
                          </div>
                          <Link url={step.url}>
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
                <Text variant="headingLg" as="h3">Helpful Resources</Text>
                <BlockStack gap="300">
                  {helpfulLinks.map((link) => (
                    <InlineStack key={link.url} gap="300" align="start" blockAlign="start">
                      <div style={{ flexShrink: 0 }}>
                        <Icon source={ExternalIcon} />
                      </div>
                      <Link url={link.url} external>
                        {link.text}
                      </Link>
                    </InlineStack>
                  ))}
                </BlockStack>
                <Box paddingBlockStart="400">
                  <Text variant="headingSm">Need Help?</Text>
                  <Text variant="bodyMd">Our support team is here for you. Click the button below to contact us.</Text>
                </Box>
                <Box paddingBlockStart="200">
                  <Button variant='primary' onClick={onModalOpen}>
                    Contact support
                  </Button>
                </Box>
              </BlockStack>
            </Card>
            <Box paddingBlockStart="400">
              <Card>
                <img
                  src="/api/placeholder/600/400"
                  alt="SimpleBundle app showcase"
                  style={{ width: '100%', height: 'auto' }}
                />
              </Card>
            </Box>
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
/>
    </Page>
  );
}
