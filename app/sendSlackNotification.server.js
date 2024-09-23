import Slack from '@slack/bolt';

const app = new Slack.App({

    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN
});


export async function sendSlackNotification(storeData) {

    // Calculate store age
    const storeAge = calculateStoreAge(storeData.createdAt);

    await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: 'shopify-product-alerts',
        text: 'New Shopify Store Installation',
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "New Shopify Store Installation",
                    emoji: true
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Store URL:*\n${storeData.url}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Email:*\n${storeData.email}`
                    }
                ]
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Phone:*\n${storeData.phone || 'Not provided'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Store Age:*\n${storeAge}`
                    }
                ]
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Plan:*\n${storeData.planDisplayName}`
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Additional Details:*"
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `
• Myshopify Domain: ${storeData.myshopifyDomain}
• Country: ${storeData.country || 'Not provided'}
• Timezone: ${storeData.ianaTimezone}
• Eligible for Bundles: ${storeData.eligibleForBundles ? 'Yes' : 'No'}
• Storefront Enabled: ${storeData.storefront ? 'Yes' : 'No'}
• Partner Development: ${storeData.partnerDevelopment ? 'Yes' : 'No'}
• Shopify Plus: ${storeData.shopifyPlus ? 'Yes' : 'No'}
                        `
                    }
                ]
            }
        ]
    });
}

function calculateStoreAge(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
        return `${diffDays} days`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''}`;
    }
}


export async function sendSupportSlackNotification({ email, message, requestType, timestamp, shopDomain }) {
    return await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: 'simplebundle-support',
        text: 'New Support Request',
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "New Support Request",
                    emoji: true
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Shop Domain:*\n${shopDomain}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Email:*\n${email}`
                    }
                ]
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Request Type:*\n${requestType}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Timestamp:*\n${timestamp}`
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Message:*\n${message}`
                }
            }
        ]
    });

}


export async function sendUninstallNotification(deletedStoreInfo) {

    await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: 'shopify-product-alerts',
        text: 'App Uninstalled',
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "Store uninstalled SimpleBundleApp",
                    emoji: true
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Shop Domain:*\n${deletedStoreInfo.shop}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Email:*\n${deletedStoreInfo.email}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Name:*\n${deletedStoreInfo.name}`
                    }

                ]
            }
        ]
    });

}
