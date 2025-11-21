# CI/CD Pipeline Documentation

## Overview

The Tour Guide application uses GitHub Actions for continuous integration and deployment. The pipeline automatically runs on every push to `main` and on all pull requests.

## Pipeline Stages

### 1. Lint & Type Check
- **Runs on**: All pushes and PRs
- **Purpose**: Ensure code quality and type safety
- **Steps**:
  - Install dependencies
  - Generate Prisma Client
  - Run ESLint
  - Run TypeScript type checking

### 2. Build
- **Runs on**: After lint passes
- **Purpose**: Verify the application builds successfully
- **Steps**:
  - Install dependencies
  - Generate Prisma Client
  - Build Next.js application
  - Upload build artifacts

### 3. Deploy Preview
- **Runs on**: Pull requests only
- **Purpose**: Deploy preview environments for testing
- **Deployment**: Vercel preview URL

### 4. Deploy Production
- **Runs on**: Pushes to `main` branch only
- **Purpose**: Deploy to production
- **Deployment**: Vercel production URL

## Required GitHub Secrets

To enable the full CI/CD pipeline, configure the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Vercel Secrets

1. **VERCEL_TOKEN**
   - Get from: https://vercel.com/account/tokens
   - Create a new token with appropriate permissions

2. **VERCEL_ORG_ID**
   - Get from: Vercel project settings or `.vercel/project.json` after running `vercel link`
   - Run `vercel link` locally and check the generated file

3. **VERCEL_PROJECT_ID**
   - Get from: Vercel project settings or `.vercel/project.json` after running `vercel link`
   - Run `vercel link` locally and check the generated file

### Auth0 Secret (Optional for Build)

4. **AUTH0_SECRET**
   - Generate with: `openssl rand -hex 32`
   - Used during build time (can use placeholder if not needed)

## Vercel Environment Variables

Configure these in your Vercel project settings (`Settings > Environment Variables`):

### Production & Preview Environments

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
AUTH0_SECRET=<generated-secret>
APP_BASE_URL=https://your-domain.vercel.app
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

## Setup Instructions

### 1. Link Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# This creates .vercel/project.json with your IDs
```

### 2. Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to `Settings > Secrets and variables > Actions`
3. Click `New repository secret`
4. Add each secret listed above

### 3. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to `Settings > Environment Variables`
3. Add all required environment variables
4. Ensure they're enabled for Production, Preview, and Development

### 4. Test the Pipeline

```bash
# Create a new branch
git checkout -b test-cicd

# Make a small change
echo "# Test" >> test.txt

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin test-cicd

# Create a PR on GitHub and watch the pipeline run
```

## Pipeline Workflow

```
┌─────────────────┐
│  Push to main   │
│   or PR opened  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Lint & Typecheck│
│   - ESLint      │
│   - TypeScript  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Build       │
│  - Next.js      │
│  - Prisma Gen   │
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         ▼                 ▼                 ▼
    ┌────────┐      ┌──────────┐      ┌──────────┐
    │  Skip  │      │  Deploy  │      │  Deploy  │
    │        │      │ Preview  │      │   Prod   │
    │        │      │   (PR)   │      │  (main)  │
    └────────┘      └──────────┘      └──────────┘
```

## Troubleshooting

### Build Fails on Prisma Generate

**Issue**: `Error: P1012 - datasource property 'url' is no longer supported`

**Solution**: Ensure you're using Prisma 7+ configuration with `prisma.config.ts`

### Deployment Fails

**Issue**: Missing environment variables

**Solution**: 
1. Check Vercel project settings
2. Ensure all required env vars are set
3. Verify they're enabled for the correct environments

### Type Check Fails

**Issue**: TypeScript errors in CI but not locally

**Solution**:
1. Run `npm run build` locally
2. Fix any type errors
3. Ensure `tsconfig.json` is committed

## Monitoring

- **GitHub Actions**: View pipeline runs in the `Actions` tab
- **Vercel Dashboard**: Monitor deployments and logs
- **Build Logs**: Check detailed logs for each step

## Best Practices

1. **Always create PRs**: This triggers preview deployments
2. **Review preview URLs**: Test changes before merging
3. **Monitor build times**: Optimize if builds take too long
4. **Keep secrets secure**: Never commit secrets to the repository
5. **Use environment-specific configs**: Different settings for dev/preview/prod
