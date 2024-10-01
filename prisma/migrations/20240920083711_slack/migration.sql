-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "onboarding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" SERIAL NOT NULL,
    "bundleName" TEXT NOT NULL,
    "bundleType" TEXT NOT NULL,
    "ProductBundleId" TEXT,
    "ProductHandle" TEXT,
    "description" TEXT,
    "discountType" TEXT,
    "discountValue" TEXT,
    "products" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "variants" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" SERIAL NOT NULL,
    "revenue" TEXT NOT NULL,
    "orders" TEXT NOT NULL,
    "currency" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopInstallation" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyStore" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "myshopifyDomain" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "eligibleForBundles" BOOLEAN NOT NULL,
    "storefront" BOOLEAN NOT NULL,
    "maxProductVariants" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "planDisplayName" TEXT NOT NULL,
    "partnerDevelopment" BOOLEAN NOT NULL,
    "shopifyPlus" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "ianaTimezone" TEXT NOT NULL,
    "primaryDomainId" TEXT NOT NULL,
    "country" TEXT,
    "expandOperation" BOOLEAN NOT NULL,
    "mergeOperation" BOOLEAN NOT NULL,
    "updateOperation" BOOLEAN NOT NULL,

    CONSTRAINT "ShopifyStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopInstallation_shop_key" ON "ShopInstallation"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyStore_shop_key" ON "ShopifyStore"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyStore_myshopifyDomain_key" ON "ShopifyStore"("myshopifyDomain");

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyStore" ADD CONSTRAINT "ShopifyStore_shop_fkey" FOREIGN KEY ("shop") REFERENCES "ShopInstallation"("shop") ON DELETE RESTRICT ON UPDATE CASCADE;
