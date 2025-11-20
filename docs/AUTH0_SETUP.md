# Auth0 OAuth Setup Guide

This guide will walk you through setting up Auth0 authentication for the Tour Guide application.

## Prerequisites

- An Auth0 account (sign up at https://auth0.com if you don't have one)
- Your application running locally or deployed to Vercel

## Step 1: Create Auth0 Application

### 1.1 Go to Auth0 Dashboard
1. Visit https://manage.auth0.com
2. Log in to your account
3. Select your tenant (or create a new one)

### 1.2 Create a New Application
1. Click **Applications** → **Applications** in the sidebar
2. Click **Create Application**
3. Enter application details:
   - **Name**: `Tour Guide` (or your preferred name)
   - **Application Type**: Select **Regular Web Applications**
4. Click **Create**

## Step 2: Configure Application Settings

### 2.1 Basic Settings
In your application settings, configure the following:

#### **Allowed Callback URLs**
Add these URLs (one per line):
```
http://localhost:3000/api/auth/callback
https://your-domain.vercel.app/api/auth/callback
```

**Note**: Replace `your-domain.vercel.app` with your actual Vercel domain

#### **Allowed Logout URLs**
Add these URLs (one per line):
```
http://localhost:3000
https://your-domain.vercel.app
```

#### **Allowed Web Origins**
Add these URLs (one per line):
```
http://localhost:3000
https://your-domain.vercel.app
```

### 2.2 Save Your Credentials
Scroll to the top and note these values (you'll need them):
- **Domain** (e.g., `dev-abc123.us.auth0.com`)
- **Client ID** (e.g., `abc123xyz...`)
- **Client Secret** (click "Show" to reveal)

### 2.3 Advanced Settings (Optional but Recommended)

Click **Advanced Settings** at the bottom:

#### **Grant Types**
Ensure these are checked:
- ✅ Authorization Code
- ✅ Refresh Token

#### **Token Endpoint Authentication Method**
- Select: **Post**

Click **Save Changes**

## Step 3: Configure User Roles

### 3.1 Create Roles
1. Go to **User Management** → **Roles**
2. Click **Create Role**

#### Create "Manager" Role:
- **Name**: `Manager`
- **Description**: `Tour Manager - Full access to create and manage tours`
- Click **Create**

#### Create "Seller" Role:
- **Name**: `Seller`
- **Description**: `Seller - Can update stock counts`
- Click **Create**

### 3.2 Add Role to User Metadata (Using Actions)

1. Go to **Actions** → **Flows**
2. Click on **Login**
3. Click **Custom** → **Build Custom**
4. Create a new action:
   - **Name**: `Add Roles to Token`
   - **Trigger**: `Login / Post Login`
   - **Runtime**: `Node 18`

5. Add this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://tour-guide.app';
  
  if (event.authorization) {
    // Add roles to access token
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    
    // Add role to ID token
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    
    // Add user metadata
    api.idToken.setCustomClaim(`${namespace}/user_metadata`, event.user.user_metadata);
  }
};
```

6. Click **Deploy**
7. Go back to the **Login** flow
8. Drag your new action into the flow (between Start and Complete)
9. Click **Apply**

## Step 4: Assign Roles to Users

### 4.1 Create Test Users
1. Go to **User Management** → **Users**
2. Click **Create User**
3. Enter email and password
4. Click **Create**

### 4.2 Assign Roles
1. Click on the user you just created
2. Go to the **Roles** tab
3. Click **Assign Roles**
4. Select **Manager** or **Seller**
5. Click **Assign**

## Step 5: Configure Environment Variables

### 5.1 Generate AUTH0_SECRET
Run this command in your terminal:
```bash
openssl rand -hex 32
```

Copy the output.

### 5.2 Update Local .env File
Edit your `.env` file with the values from Auth0:

```env
# Database (Neon DB)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Auth0
AUTH0_SECRET="<paste the output from openssl rand -hex 32>"
APP_BASE_URL="http://localhost:3000"
AUTH0_DOMAIN="dev-abc123.us.auth0.com"  # Your Auth0 domain
AUTH0_CLIENT_ID="your-client-id-here"
AUTH0_CLIENT_SECRET="your-client-secret-here"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 5.3 Add to Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `DATABASE_URL` | Your Neon DB connection string | Production, Preview, Development |
| `AUTH0_SECRET` | Generated secret | Production, Preview, Development |
| `APP_BASE_URL` | `https://your-domain.vercel.app` | Production |
| `APP_BASE_URL` | `https://your-preview-domain.vercel.app` | Preview |
| `AUTH0_DOMAIN` | Your Auth0 domain | Production, Preview, Development |
| `AUTH0_CLIENT_ID` | Your Auth0 Client ID | Production, Preview, Development |
| `AUTH0_CLIENT_SECRET` | Your Auth0 Client Secret | Production, Preview, Development |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob token | Production, Preview, Development |

**Important**: For Preview environment, use a placeholder for `APP_BASE_URL` or leave it dynamic.

## Step 6: Test Authentication

### 6.1 Start Your Development Server
```bash
npm run dev
```

### 6.2 Create Auth Routes

Create `app/api/auth/[auth0]/route.ts`:

```typescript
import { auth0 } from '@/lib/auth0';

export const GET = auth0.handleAuth();
```

### 6.3 Test Login Flow

1. Visit http://localhost:3000/api/auth/login
2. You should be redirected to Auth0
3. Log in with your test user
4. You should be redirected back to your app

### 6.4 Check Session

Create a test page to verify authentication works:

```typescript
// app/profile/page.tsx
import { auth0 } from '@/lib/auth0';

export default async function ProfilePage() {
  const session = await auth0.getSession();
  
  if (!session) {
    return <div>Not logged in</div>;
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(session.user, null, 2)}</pre>
    </div>
  );
}
```

Visit http://localhost:3000/profile to see your user data.

## Step 7: Implement Role-Based Access

### 7.1 Create Role Guard Component

```typescript
// components/RoleGuard.tsx
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

type Role = 'Manager' | 'Seller';

export async function RoleGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }
  
  const userRoles = session.user['https://tour-guide.app/roles'] || [];
  const hasAccess = allowedRoles.some(role => userRoles.includes(role));
  
  if (!hasAccess) {
    return <div>Access Denied</div>;
  }
  
  return <>{children}</>;
}
```

### 7.2 Use in Pages

```typescript
// app/tours/new/page.tsx
import { RoleGuard } from '@/components/RoleGuard';

export default function NewTourPage() {
  return (
    <RoleGuard allowedRoles={['Manager']}>
      <h1>Create New Tour</h1>
      {/* Only managers can see this */}
    </RoleGuard>
  );
}
```

## Troubleshooting

### Error: "Callback URL mismatch"
- Check that your callback URLs in Auth0 match exactly
- Include both `http://localhost:3000` and your Vercel domain
- Don't forget `/api/auth/callback` at the end

### Error: "Invalid state"
- Clear your browser cookies
- Regenerate your `AUTH0_SECRET`
- Make sure `AUTH0_SECRET` is at least 32 characters

### Roles not appearing in token
- Check that your Auth0 Action is deployed
- Verify the Action is in the Login flow
- Check the namespace in your Action code matches your app

### User can't log in
- Verify Auth0 credentials are correct
- Check that the user has been assigned a role
- Look at Auth0 logs: **Monitoring** → **Logs**

## Security Best Practices

1. **Never commit secrets**: Keep `.env` in `.gitignore`
2. **Use strong secrets**: Always use `openssl rand -hex 32`
3. **Rotate secrets regularly**: Update `AUTH0_SECRET` periodically
4. **Use HTTPS in production**: Never use `http://` for production URLs
5. **Implement CSRF protection**: Auth0 SDK handles this automatically
6. **Monitor Auth0 logs**: Check for suspicious activity

## Next Steps

1. ✅ Auth0 application created
2. ✅ Callback URLs configured
3. ✅ Roles created and assigned
4. ✅ Environment variables set
5. ✅ Test authentication working
6. 🔜 Build user interface
7. 🔜 Implement role-based features
8. 🔜 Deploy to production

---

**Need Help?**
- Auth0 Documentation: https://auth0.com/docs
- Auth0 Community: https://community.auth0.com
- Next.js Auth0 SDK: https://github.com/auth0/nextjs-auth0
