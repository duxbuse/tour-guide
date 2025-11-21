# Test Data Seeding Script

This directory contains scripts for populating the database with realistic test data for development and testing purposes.

## Quick Start

To populate your database with test data:

```bash
npm run db:seed-test
```

## ✅ Status: Complete

The inventory default value saving issue has been **successfully resolved** and the database has been populated with comprehensive test data. The application is now ready for testing the inventory functionality.

## What Gets Created

### Users
- **Manager** (`manager@test.com`, auth0Id: `auth0|691f989d2bc713054fec2340`) - Has full access to create/delete items and view all reports
- **Seller** (`seller@test.com`, auth0Id: `auth0|691f98c8b7368a8df0744c61`) - Can edit quantities and track inventory for specific shows

### Tour
- **Summer World Tour 2024** (June 1 - September 30, 2024)

### Shows
1. **London - O2 Arena** (June 15, 2024) - ✅ Completed
2. **Paris - AccorHotels Arena** (June 18, 2024) - ✅ Completed  
3. **New York - Madison Square Garden** (July 2, 2024) - ✅ Completed
4. **Los Angeles - Staples Center** (July 5, 2024) - 🔄 Upcoming

### Merchandise
1. **Summer Tour 2024 T-Shirt** - $25.00
   - Sizes S, M, L, XL (all Unisex)
   
2. **Tour Hoodie** - $45.00
   - Sizes S, M, L (all Unisex)
   
3. **Concert Poster** - $15.00
   - One Size

## Test Scenarios

### Testing Inventory Default Values ✨
The main scenario for testing the inventory bug fix:

- **T-Shirt Size S** starts with **15 units**
- After 3 completed shows: London (3 sold) → Paris (3 sold) → New York (2 sold)
- Current count: **7 units remaining**
- **Test**: For the upcoming LA show, the smart default should show **7** as start count (not 0)

### Testing Smart Default Calculation
1. **Sequential Shows**: Each show uses the previous show's end count as the default start count
2. **Added Inventory**: Paris show demonstrates adding 5 more T-shirt M units mid-tour
3. **Multiple Variants**: Different items have different sales patterns

### Testing Different User Roles
1. **Manager View**: Can see all inventory records and create/delete items
2. **Seller View**: Must select a show before editing inventory

### Testing Inventory Calculations
- **Sold Count**: Automatically calculated as `startCount + addedCount - endCount`
- **Negative Sales**: Should never occur with the fix (was showing -14 before)
- **Missing Data**: Some variants have no inventory records yet (clean slate testing)

## Expected Behavior After Fix

When you select the **T-Shirt Size S** for the **Los Angeles show**:
1. Start count should default to **7** (from New York's end count)
2. If you enter end count **5**, it should show "**Items Sold: 2**" (not negative numbers)
3. Smart defaults work for variants with no previous records (uses base quantity)
4. No React controlled/uncontrolled component warnings in console

## Data Structure Overview

```
Tour: Summer World Tour 2024
├── Show: London (completed)
│   ├── T-shirt S: 15 → 12 (3 sold)
│   ├── T-shirt M: 30 → 25 (5 sold)
│   └── Hoodie S: 10 → 8 (2 sold)
├── Show: Paris (completed)
│   ├── T-shirt S: 12 → 9 (3 sold)
│   └── T-shirt M: 25+5 → 22 (8 sold)
├── Show: New York (completed)
│   └── T-shirt S: 9 → 7 (2 sold)
└── Show: Los Angeles (upcoming)
    └── [Will use smart defaults from previous shows]
```

## Cleaning Data

To reset and repopulate the database:

```bash
npm run db:seed-test
```

The script automatically clears existing data before creating new test data.

## Files

- `seed-test-data.mjs` - Main seeding script with comprehensive test data
- `README.md` - This documentation file