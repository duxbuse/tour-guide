# Vercel Deployment Guide

This guide will help you deploy the TourGuide application to Vercel with a Neon PostgreSQL database.

## Prerequisites

1. [Vercel Account](https://vercel.com)
2. [Neon Account](https://console.neon.tech) for PostgreSQL database
3. [Auth0 Account](https://auth0.com) for authentication
4. GitHub repository with your code

## 1. Database Setup (Neon)

### Create a Neon Database
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@host.neon.tech:5432/database?sslmode=require`)

### Update Schema for Production
The application automatically switches databases:
- **Local Development**: SQLite (`file:./dev.db`)
- **Production (Vercel)**: PostgreSQL (Neon)

**Important**: This project uses Prisma 7.0.0 which has a new configuration system that removes the `url` property from schema files.

## 2. Vercel Environment Variables

In your Vercel project settings, add these environment variables:

### Database Configuration
```bash
DATABASE_URL=your_neon_connection_string_here
```

**Note**: The application automatically detects PostgreSQL URLs and switches to production mode.

### Auth0 Configuration
```bash
AUTH0_SECRET=your-32-byte-secret-here
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
APP_BASE_URL=https://your-vercel-domain.vercel.app
```

### Vercel Blob (Image Storage)
```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 3. Database Migration

### For Vercel Deployment

1. **Set Environment Variables**: Set `DATABASE_URL` to your Neon connection string in Vercel
2. **Deploy**: Vercel will automatically run the migrations during build
3. **Schema Generation**: Prisma will generate the client based on your environment

The build process automatically runs `prisma generate && next build` as defined in `package.json`.

### Manual Database Setup (if needed)
If you need to run migrations manually:

```bash
# Set your production DATABASE_URL locally
export DATABASE_URL="your_neon_connection_string"
npx prisma db push
```

## 4. Seed Data for Production

Create a production seed script that works with PostgreSQL:

```bash
# After deployment, you can run this in Vercel Functions or locally with production DB
node scripts/seed-test-data.mjs
```

## 5. Deployment Steps

1. **Push to GitHub**: Ensure all changes are committed
2. **Connect to Vercel**: Import your GitHub repository
3. **Set Environment Variables**: Add all variables listed above
4. **Deploy**: Vercel will automatically build and deploy

## 6. Post-Deployment

### Verify Deployment
1. Check your deployed app works
2. Test authentication (Auth0)
3. Test database connectivity
4. Verify image uploads (Vercel Blob)

### Run Seed Data
Access Vercel Functions or use a one-time deployment script to seed your production database.

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify your Neon connection string is correct
- Ensure the connection string starts with `postgresql://`
- Check that your database allows external connections
- For Prisma 7.0.0: Ensure no `url` property exists in schema files

**Auth0 Issues**  
- Update your Auth0 application settings with the new Vercel domain
- Verify callback URLs include your Vercel domain
- Ensure all Auth0 environment variables are set

**Build Failures**
- Check all required environment variables are set in Vercel
- Verify your Neon database is accessible during build time

### Environment Variable Format
Ensure your Neon connection string follows this format:
```
postgresql://username:password@endpoint.region.neon.tech:5432/database?sslmode=require
```

## Local vs Production Configuration

| Environment | Database | Provider | Detection Method |
|------------|----------|----------|------------------|
| Local | SQLite | sqlite | When DATABASE_URL starts with `file:` or undefined |
| Production | Neon PostgreSQL | postgresql | When DATABASE_URL starts with `postgresql://` |

The application automatically switches between databases based on the `DATABASE_URL` format and `NODE_ENV`.

## Prisma 7.0.0 Changes

This project uses Prisma 7.0.0 which requires:
- No `url` property in `prisma/schema.prisma`
- Database URL configured via environment variables
- Client configuration handles connection string detection

## Security Notes

- Never commit real environment variables to your repository
- Use Vercel's secure environment variable storage
- Keep your Auth0 secrets secure
- Rotate secrets regularly in production

## Support

For additional help:
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth0 Documentation](https://auth0.com/docs)