-- Add indexes for better query performance

-- Index on User auth0Id for faster user lookups (likely already exists as unique constraint, but ensuring)
CREATE INDEX IF NOT EXISTS "User_auth0Id_idx" ON "User"("auth0Id");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Indexes on Tour for manager queries
CREATE INDEX IF NOT EXISTS "Tour_managerId_idx" ON "Tour"("managerId");
CREATE INDEX IF NOT EXISTS "Tour_isActive_idx" ON "Tour"("isActive");
CREATE INDEX IF NOT EXISTS "Tour_managerId_isActive_idx" ON "Tour"("managerId", "isActive");

-- Indexes on Show for tour and date queries
CREATE INDEX IF NOT EXISTS "Show_tourId_idx" ON "Show"("tourId");
CREATE INDEX IF NOT EXISTS "Show_date_idx" ON "Show"("date");
CREATE INDEX IF NOT EXISTS "Show_tourId_date_idx" ON "Show"("tourId", "date");

-- Indexes on MerchItem for tour queries
CREATE INDEX IF NOT EXISTS "MerchItem_tourId_idx" ON "MerchItem"("tourId");

-- Indexes on MerchVariant for merch item queries
CREATE INDEX IF NOT EXISTS "MerchVariant_merchItemId_idx" ON "MerchVariant"("merchItemId");
CREATE INDEX IF NOT EXISTS "MerchVariant_quantity_idx" ON "MerchVariant"("quantity"); -- For low stock queries

-- Indexes on InventoryRecord for show and variant queries (most important for performance)
CREATE INDEX IF NOT EXISTS "InventoryRecord_showId_idx" ON "InventoryRecord"("showId");
CREATE INDEX IF NOT EXISTS "InventoryRecord_variantId_idx" ON "InventoryRecord"("variantId");
CREATE INDEX IF NOT EXISTS "InventoryRecord_show_variant_idx" ON "InventoryRecord"("showId", "variantId");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "Show_tour_manager_idx" ON "Show"("tourId") 
  WHERE EXISTS (SELECT 1 FROM "Tour" WHERE "Tour"."id" = "Show"."tourId");

-- Index on updatedAt fields for ordering
CREATE INDEX IF NOT EXISTS "Tour_updatedAt_idx" ON "Tour"("updatedAt");
CREATE INDEX IF NOT EXISTS "InventoryRecord_updatedAt_idx" ON "InventoryRecord"("updatedAt");