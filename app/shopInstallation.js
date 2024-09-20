import prisma from "./db.server";


export async function checkFirstInstall(shop) {
    try {
        const installation = await prisma.shopInstallation.findUnique({
            where: { shop },
        });

        return !installation;

    } catch (error) {
        console.log(error);
    }

}

export async function createShopInstallation(shop) {
    try {
        return prisma.shopInstallation.create({
            data: { shop },
        });

    } catch (error) {
        console.log(error);

    }

}

export async function createShopifyStore(storeData, shopInstallationId) {

    try {
        const { shop } = storeData.data;

        return prisma.shopifyStore.create({
            data: {
                shopInstallation: {
                    connect: { id: shopInstallationId }
                },
                name: shop.name,
                myshopifyDomain: shop.myshopifyDomain,
                url: shop.url,
                eligibleForBundles: shop.features.bundles.eligibleForBundles,
                storefront: shop.features.storefront,
                maxProductVariants: shop.resourceLimits.maxProductVariants,
                currencyCode: shop.currencyCode,
                planDisplayName: shop.plan.displayName,
                partnerDevelopment: shop.plan.partnerDevelopment,
                shopifyPlus: shop.plan.shopifyPlus,
                createdAt: new Date(shop.createdAt),
                updatedAt: new Date(shop.updatedAt),
                contactEmail: shop.contactEmail,
                email: shop.email,
                description: shop.description,
                ianaTimezone: shop.ianaTimezone,
                primaryDomainId: shop.primaryDomain.id,
                country: shop.billingAddress.country,
                expandOperation: shop.features.cartTransform.eligibleOperations.expandOperation,
                mergeOperation: shop.features.cartTransform.eligibleOperations.mergeOperation,
                updateOperation: shop.features.cartTransform.eligibleOperations.updateOperation
            },
        });

    } catch (error) {

    }

}

export async function getShopifyStore(myshopifyDomain) {
    try {
        return prisma.shopifyStore.findUnique({
            where: { myshopifyDomain },
        });

    } catch (error) {

    }

}