# Auth Role Testing

This directory contains Playwright end-to-end tests for verifying role-based authentication and access control.

## Test Coverage

### Manager User Tests
- ✅ Can log in successfully
- ✅ Can access dashboard
- ✅ Can access tours page
- ✅ Can view profile
- ✅ Can log out

### Seller User Tests
- ✅ Can log in successfully
- ✅ Can access dashboard
- ✅ Can view profile
- ✅ Has correct role in session

### Unauthenticated Access Tests
- ✅ Redirected to login when accessing protected pages
- ✅ Can access public home page

### Role-Based Access Control Tests
- ✅ Manager and Seller have different access levels
- ✅ Each user sees their own data

## Prerequisites

Before running the tests, ensure you have:

1. **Auth0 Test Users**: Two users created in Auth0 with different roles:
   - One user with "Manager" role
   - One user with "Seller" role

2. **Environment Variables**: Add these to your `.env` file:
   ```env
   AUTH0_MANAGER_EMAIL=manager@example.com
   AUTH0_MANAGER_PASSWORD=your-manager-password
   AUTH0_SELLER_EMAIL=seller@example.com
   AUTH0_SELLER_PASSWORD=your-seller-password
   ```

3. **Development Server**: The app must be running on `http://localhost:3000`
   ```bash
   npm run dev
   ```

## Running the Tests

### Run all tests
```bash
npx playwright test
```

### Run only auth tests
```bash
npx playwright test auth-roles
```

### Run tests in headed mode (see the browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests in UI mode (interactive)
```bash
npx playwright test --ui
```

### Run specific test
```bash
npx playwright test -g "Manager can log in"
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Troubleshooting

### Tests are failing with timeout errors
- Ensure your dev server is running (`npm run dev`)
- Check that Auth0 credentials in `.env` are correct
- Increase timeout in test if Auth0 is slow: `{ timeout: 30000 }`

### Tests can't find login form
- Verify Auth0 is configured correctly
- Check that callback URLs are set in Auth0 dashboard
- Ensure middleware is working correctly

### Tests pass locally but fail in CI
- Make sure all environment variables are set in CI
- Consider using Auth0 test tenant for CI
- Check that the base URL is correct for CI environment

## Writing New Tests

When adding new role-based tests:

1. **Always start with clean state**:
   ```typescript
   test.use({ storageState: { cookies: [], origins: [] } });
   ```

2. **Use the login helper**:
   ```typescript
   await login(page, email, password);
   ```

3. **Test both positive and negative cases**:
   - User CAN access allowed pages
   - User CANNOT access restricted pages

4. **Check for specific content**:
   ```typescript
   await expect(page.locator('text=Expected Content')).toBeVisible();
   ```

## Security Notes

⚠️ **Never commit real passwords to version control**

- Use test accounts with limited permissions
- Rotate test credentials regularly
- Consider using Auth0 test tenants for CI/CD
- Add `.env` to `.gitignore` (already done)

## CI/CD Integration

To run these tests in GitHub Actions, add the following to your workflow:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npx playwright test
  env:
    AUTH0_MANAGER_EMAIL: ${{ secrets.AUTH0_MANAGER_EMAIL }}
    AUTH0_MANAGER_PASSWORD: ${{ secrets.AUTH0_MANAGER_PASSWORD }}
    AUTH0_SELLER_EMAIL: ${{ secrets.AUTH0_SELLER_EMAIL }}
    AUTH0_SELLER_PASSWORD: ${{ secrets.AUTH0_SELLER_PASSWORD }}

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Test Structure

```
tests/
├── auth-roles.spec.ts    # Role-based authentication tests
└── example.spec.ts       # Playwright example (can be deleted)
```

## Next Steps

- [ ] Add tests for Manager-only features (creating tours, adding merch)
- [ ] Add tests for Seller-only features (updating stock counts)
- [ ] Add tests for "Access Denied" scenarios
- [ ] Add visual regression tests
- [ ] Add API endpoint tests
