# Getting Your Vercel Org ID and Project ID

## Understanding Vercel IDs

For **personal accounts**, your **User ID** and **Org ID** are the same value. Vercel uses "Org ID" terminology for both personal and team accounts.

## Method 1: Using Vercel CLI (Easiest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Your Project
```bash
vercel link
```

This will:
1. Ask you to select your scope (your username)
2. Ask if you want to link to an existing project or create new one
3. Create a `.vercel` folder with a `project.json` file

### Step 4: Get Your IDs
```bash
cat .vercel/project.json
```

You'll see something like:
```json
{
  "orgId": "team_xxxxxxxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxxxxxxx"
}
```

**Note**: Even for personal accounts, the `orgId` will start with `team_`. This is normal!

## Method 2: From Vercel Dashboard

### Get Project ID:
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **General**
4. Scroll to **Project ID**
5. Copy the value (starts with `prj_`)

### Get Org ID (User ID):
1. Go to https://vercel.com/account
2. Click on **Settings**
3. Look for your **User ID** or **Team ID**
4. Copy the value (starts with `team_` even for personal accounts)

**Alternative**: Check the URL when you're on your dashboard:
- URL format: `https://vercel.com/[your-username]`
- Your Org ID is derived from your username

## Method 3: From API Token Page

1. Go to https://vercel.com/account/tokens
2. Create a new token (or use existing)
3. The token creation page will show your **Team ID** (which is your Org ID)

## Method 4: Using Vercel API

```bash
# First, get your token from https://vercel.com/account/tokens
# Then run:

curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v2/user

# This will return your user info including the ID
```

## Adding to GitHub Secrets

Once you have your IDs:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add three secrets:

   **VERCEL_TOKEN**
   - Value: Your Vercel API token from https://vercel.com/account/tokens

   **VERCEL_ORG_ID**
   - Value: Your Org ID (e.g., `team_xxxxxxxxxxxxxxxxxxxxx`)
   - For personal accounts, this is the same as your User ID

   **VERCEL_PROJECT_ID**
   - Value: Your Project ID (e.g., `prj_xxxxxxxxxxxxxxxxxxxxx`)

## Quick Reference

| What | Where to Find | Format |
|------|---------------|--------|
| **Vercel Token** | https://vercel.com/account/tokens | `vercel_xxxxx...` |
| **Org ID** | `.vercel/project.json` or Account Settings | `team_xxxxx...` |
| **Project ID** | `.vercel/project.json` or Project Settings | `prj_xxxxx...` |

## Troubleshooting

### "I only see User ID, not Org ID"
- For personal accounts, **User ID = Org ID**
- Use the same value for both
- It will typically start with `team_` even for personal accounts

### "vercel link" asks for scope
- Choose your username (personal account)
- This becomes your Org ID

### "I don't have a project yet"
- Run `vercel` in your project directory to create one
- Or create one manually in the Vercel dashboard
- Then run `vercel link` to connect it

## Example: Complete Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link project (creates .vercel/project.json)
vercel link

# 4. View your IDs
cat .vercel/project.json

# Output:
# {
#   "orgId": "team_abc123xyz",
#   "projectId": "prj_def456uvw"
# }

# 5. Add these to GitHub Secrets:
# - VERCEL_ORG_ID = team_abc123xyz
# - VERCEL_PROJECT_ID = prj_def456uvw
# - VERCEL_TOKEN = (from https://vercel.com/account/tokens)
```

## Next Steps

After adding the secrets:
1. Push to your repository
2. Create a Pull Request
3. Watch the GitHub Actions run
4. Your app will be deployed to Vercel automatically! 🚀
