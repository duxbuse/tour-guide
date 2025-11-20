# Auth0 Quick Setup Checklist

## 🎯 Quick Start (5 Minutes)

### 1. Create Auth0 Application
- [ ] Go to https://manage.auth0.com
- [ ] Create new application: **Regular Web Application**
- [ ] Name it: `Tour Guide`

### 2. Configure Callback URLs
Add these to your Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback
https://your-app.vercel.app/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
https://your-app.vercel.app
```

**Allowed Web Origins:**
```
http://localhost:3000
https://your-app.vercel.app
```

### 3. Copy Credentials
From Auth0 dashboard, copy these values:
- [ ] Domain (e.g., `dev-abc123.us.auth0.com`)
- [ ] Client ID
- [ ] Client Secret (click "Show")

### 4. Generate Secret
```bash
openssl rand -hex 32
```
Copy the output.

### 5. Update .env File
```env
AUTH0_SECRET="<paste generated secret>"
APP_BASE_URL="http://localhost:3000"
AUTH0_DOMAIN="dev-abc123.us.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
```

### 6. Test It!
```bash
npm run dev
```

Visit:
- http://localhost:3000/api/auth/login (to log in)
- http://localhost:3000/profile (to see your profile)
- http://localhost:3000/api/auth/logout (to log out)

## ✅ Verification

Test these URLs:
- [ ] `/api/auth/login` - Redirects to Auth0
- [ ] `/api/auth/callback` - Handles callback
- [ ] `/profile` - Shows user data
- [ ] `/api/auth/logout` - Logs out

## 🎭 Roles Setup (Optional - 10 Minutes)

### Create Roles
1. Go to **User Management** → **Roles**
2. Create two roles:
   - `Manager` - Full access
   - `Seller` - Limited access

### Add Roles to Token
1. Go to **Actions** → **Flows** → **Login**
2. Create custom action: `Add Roles to Token`
3. Paste this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://tour-guide.app';
  if (event.authorization) {
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

4. Deploy and add to Login flow

### Assign Roles to Users
1. Go to **User Management** → **Users**
2. Click on a user
3. **Roles** tab → **Assign Roles**
4. Select `Manager` or `Seller`

## 🚀 Production Deployment

### Update Vercel Environment Variables
Add these in Vercel dashboard:
- [ ] `AUTH0_SECRET`
- [ ] `APP_BASE_URL` (use your Vercel domain)
- [ ] `AUTH0_DOMAIN`
- [ ] `AUTH0_CLIENT_ID`
- [ ] `AUTH0_CLIENT_SECRET`

### Update Auth0 Callback URLs
Add your production URL:
```
https://your-app.vercel.app/api/auth/callback
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Callback URL mismatch" | Check Auth0 settings match exactly |
| "Invalid state" | Clear cookies, regenerate AUTH0_SECRET |
| Can't log in | Check Auth0 credentials in .env |
| Roles not showing | Verify Action is deployed and in flow |

## 📚 Full Documentation

See `docs/AUTH0_SETUP.md` for complete details.

## 🎉 You're Done!

Your app now has:
- ✅ User authentication
- ✅ Login/logout flows
- ✅ Protected routes
- ✅ Role-based access (if configured)

Next: Build your features! 🚀
