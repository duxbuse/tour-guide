-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auth0Id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SELLER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "managerId" TEXT NOT NULL,
    CONSTRAINT "Tour_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "venue" TEXT,
    "ticketsSold" INTEGER,
    "totalTickets" INTEGER,
    "cost" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tourId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Show_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerchItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "tourId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MerchItem_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerchVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "size" TEXT NOT NULL,
    "type" TEXT,
    "price" REAL NOT NULL,
    "merchItemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MerchVariant_merchItemId_fkey" FOREIGN KEY ("merchItemId") REFERENCES "MerchItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startCount" INTEGER NOT NULL DEFAULT 0,
    "addedCount" INTEGER NOT NULL DEFAULT 0,
    "endCount" INTEGER,
    "soldCount" INTEGER,
    "showId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryRecord_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryRecord_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "MerchVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0Id_key" ON "User"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryRecord_showId_variantId_key" ON "InventoryRecord"("showId", "variantId");
