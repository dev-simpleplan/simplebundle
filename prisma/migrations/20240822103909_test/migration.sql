-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bundle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bundleName" TEXT NOT NULL,
    "ProductBundleId" TEXT,
    "ProductHandle" TEXT,
    "description" TEXT,
    "discountType" TEXT,
    "discountValue" TEXT,
    "products" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variants" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bundle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bundle" ("ProductBundleId", "ProductHandle", "bundleName", "createdAt", "description", "discountType", "discountValue", "id", "products", "updatedAt", "userId", "variants") SELECT "ProductBundleId", "ProductHandle", "bundleName", "createdAt", "description", "discountType", "discountValue", "id", "products", "updatedAt", "userId", "variants" FROM "Bundle";
DROP TABLE "Bundle";
ALTER TABLE "new_Bundle" RENAME TO "Bundle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
