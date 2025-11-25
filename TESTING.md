# Testing Guide

## 🧪 Auth Role Testing Complete!

I've created a comprehensive test suite to verify that Manager and Seller users can log in and see only the appropriate content.

## 📋 What Was Created

### 1. Test Files
- **`tests/auth-roles.spec.ts`** - Authentication and role verification tests:
  - Manager authentication and access
  - Seller authentication and access
  - Unauthenticated user redirects
  - Role-based access control verification
  - Database role verification via `/api/auth/sync`
  - Reports page access control

- **`tests/rbac-sync.spec.ts`** - Comprehensive RBAC implementation tests:
  - Sync endpoint role assignment
  - Role persistence across sessions
  - Role-based UI element visibility
  - Invitation flow role assignment
  - API route protection (manager-only endpoints)
  - Seller access restrictions

### 2. Configuration
- **`playwright.config.ts`** - Updated to:
  - Load environment variables from `.env`
  - Set base URL for tests
  - Run tests sequentially (to avoid auth conflicts)

### 3. Documentation
- **`tests/README.md`** - Complete guide for running and writing tests

### 4. Package Scripts
Added convenient npm scripts:
```bash
npm test              # Run all tests
npm run test:ui       # Interactive UI mode
npm run test:headed   # See browser while testing
npm run test:debug    # Debug mode
npm run test:auth     # Run only auth tests
npm run test:rbac     # Run only RBAC tests
```

## 🚀 How to Run Tests

### Prerequisites
1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Ensure your `.env` file has the test credentials:
   ```env
   AUTH0_MANAGER_EMAIL=your-manager@example.com
   AUTH0_MANAGER_PASSWORD=your-manager-password
   AUTH0_SELLER_EMAIL=your-seller@example.com
   AUTH0_SELLER_PASSWORD=your-seller-password
   ```

### Run the Tests

**Quick test (Chromium only):**
```bash
npx playwright test auth-roles --project=chromium
```

**All browsers:**
```bash
npm run test:auth
```

**Interactive mode (recommended for first run):**
```bash
npm run test:ui
```

**See the browser in action:**
```bash
npm run test:headed
```

## 📊 Test Coverage

### Manager User Tests ✅
- [x] Can log in successfully
- [x] Can access dashboard
- [x] Can access tours page
- [x] Can view profile
- [x] Can log out

### Seller User Tests ✅
- [x] Can log in successfully
- [x] Can access dashboard
- [x] Can view profile
- [x] Has correct role in session

### Security Tests ✅
- [x] Unauthenticated users redirected to login
- [x] Public pages accessible without auth
- [x] Different users see different data

### Role-Based Access Control ✅
- [x] Manager and Seller have separate sessions
- [x] Each user sees their own email/data
- [x] Manager has MANAGER role in database
- [x] Seller has SELLER role in database
- [x] Roles persist across page navigations
- [x] Manager can access Reports page
- [x] Seller CANNOT access Reports page
- [x] Manager sees manager-specific UI (New Tour button)
- [x] Seller does NOT see manager-specific UI
- [x] Manager can access `/api/invitations`
- [x] Seller CANNOT access `/api/invitations` (403)
- [x] Manager can access `/api/seller-assignments`
- [x] Seller can access `/api/seller-assignments` (read-only)

## 🔍 What the Tests Verify

1. **Authentication Flow**
   - Users can log in via Auth0
   - Session is maintained across pages
   - Logout works correctly

2. **Authorization**
   - Protected pages require authentication
   - Public pages are accessible
   - Each role has appropriate access

3. **User Isolation**
   - Manager and Seller have separate sessions
   - User data is correctly scoped

4. **Database-Backed RBAC**
   - Roles stored in database (not Auth0 tokens)
   - First user gets MANAGER role
   - Subsequent users get SELLER role
   - Roles synced via `/api/auth/sync` endpoint
   - `useUserRole` hook fetches from database

5. **API Route Protection**
   - Manager-only routes enforce database role check
   - Proper 401/403 error responses
   - Seller restrictions on sensitive endpoints

## 📝 Test Structure

```typescript
// Example test
test('Manager can log in successfully', async ({ page }) => {
  await login(page, managerEmail, managerPassword);
  
  // Verify logged in
  await expect(page.locator('text=Logout')).toBeVisible();
});
```

## 🐛 Troubleshooting

### Tests timeout
- Increase timeout: `{ timeout: 30000 }`
- Check Auth0 is responding
- Verify dev server is running

### Can't find login form
- Check Auth0 callback URLs
- Verify middleware configuration
- Ensure `.env` has correct Auth0 domain

### Tests fail intermittently
- Run sequentially (already configured)
- Clear browser state between tests
- Check for race conditions

## 🎯 Next Steps

You can now:
1. Run the tests to verify your setup
2. Add more role-specific tests
3. Test Manager-only features (create tour, add merch, invite sellers)
4. Test Seller-only features (update stock, view assigned shows)
5. Test invitation acceptance flow
6. Add visual regression tests
7. Test role persistence across browser sessions

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Auth0 Testing Guide](https://auth0.com/docs/test)
- `tests/README.md` - Detailed testing guide

---

**Ready to test!** Run `npm run test:ui` to see the interactive test runner.
