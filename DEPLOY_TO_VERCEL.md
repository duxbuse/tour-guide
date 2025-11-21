# Deploy to Vercel - Prisma 7 Configuration

## Quick Fix for Vercel Deployment

The project uses Prisma 7.0.0 which requires special configuration for deployment. Follow these steps:

### 1. Create Production Schema

For Vercel deployment, you need a production-ready schema. Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// ... rest of your models (keep exactly as they are)
```

**Important**: Remove the `url` line completely for Prisma 7 deployment.

### 2. Set Environment Variables in Vercel

In your Vercel project dashboard, set these environment variables:

```bash
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-HOST.aws.neon.tech:5432/neondb?sslmode=require
AUTH0_SECRET=your-32-byte-secret
AUTH0_DOMAIN=tour-guide.au.auth0.com  
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
APP_BASE_URL=https://your-vercel-domain.vercel.app
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
NODE_ENV=production
```

### 3. Update Build Command

In Vercel, set the build command to:
```bash
npx prisma db push --accept-data-loss && npx prisma generate && next build
```

### 4. Deploy

1. Commit and push your changes to GitHub
2. Vercel will automatically build with the new configuration
3. The database will be automatically created and migrated

## Local Development vs Production

| Environment | Schema Provider | Database URL | Config Location |
|-------------|----------------|--------------|-----------------|
| Local | `sqlite` | `file:./dev.db` | `.env` file |
| Production | `postgresql` | Neon connection string | Vercel environment variables |

## Troubleshooting

If you get schema validation errors:
1. Ensure no `url` property exists in `prisma/schema.prisma`
2. Verify `DATABASE_URL` is set in Vercel environment variables
3. Make sure the Neon connection string is valid
4. Use `prisma db push` instead of `prisma migrate` for initial deployment

## Alternative: Dual Setup

If you need both local SQLite and production PostgreSQL:

1. Keep local development with SQLite
2. Use Prisma 7's client configuration for production
3. Handle database switching in the application code

This deployment guide provides the quickest path to get your tour guide application running on Vercel.