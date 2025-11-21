-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MerchVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "size" TEXT NOT NULL,
    "type" TEXT,
    "price" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "merchItemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MerchVariant_merchItemId_fkey" FOREIGN KEY ("merchItemId") REFERENCES "MerchItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MerchVariant" ("createdAt", "id", "merchItemId", "price", "size", "type", "updatedAt") SELECT "createdAt", "id", "merchItemId", "price", "size", "type", "updatedAt" FROM "MerchVariant";
DROP TABLE "MerchVariant";
ALTER TABLE "new_MerchVariant" RENAME TO "MerchVariant";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
