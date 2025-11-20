# 🎸 Tour Guide

A comprehensive web application for band tour managers to track merchandise inventory, sales, and tour logistics across multiple shows.

## Features

- 🎫 **Tour Management**: Create and manage multiple concurrent tours
- 👕 **Merchandise Tracking**: Track inventory with sizes, variants, and images
- 📊 **Show Management**: Monitor ticket sales, costs, and profitability per show
- 📦 **Stock Counting**: Real-time inventory updates after each show
- 📈 **Sales Analytics**: Calculate profit/loss per show and per head
- 📄 **Excel Export**: Generate stock reports for sellers
- 🔐 **Role-Based Access**: Separate views for Tour Managers and Sellers
- 🔄 **Auto-Sync**: Future integration with Square POS

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Neon DB](https://neon.tech/) (PostgreSQL)
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **Authentication**: [Auth0](https://auth0.com/)
- **Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **Deployment**: [Vercel](https://vercel.com/)
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- A Neon DB account
- An Auth0 account
- A Vercel account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tour-guide
   ```

2. **Run the setup script**
   ```bash
   node scripts/setup.js
   ```

   Or manually:
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npx prisma generate
   npx prisma db push
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Neon DB)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Auth0
AUTH0_SECRET="<generate with: openssl rand -hex 32>"
APP_BASE_URL="http://localhost:3000"
AUTH0_DOMAIN="your-tenant.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:migrate:deploy # Deploy migrations
npm run db:studio        # Open Prisma Studio

# Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
npm run verify           # Run all checks + build
```

## Project Structure

```
tour-guide/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-protected routes
│   ├── api/               # API routes
│   ├── tours/             # Tour management pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── NavBar.tsx
│   ├── RoleGuard.tsx
│   └── ...
├── lib/                   # Utility libraries
│   ├── db.ts             # Prisma client
│   ├── auth0.ts          # Auth0 config
│   └── blob.ts           # Vercel Blob helpers
├── prisma/               # Database schema
│   └── schema.prisma
├── scripts/              # Utility scripts
│   └── setup.js
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI/CD pipeline
└── middleware.ts         # Auth middleware
```

## User Roles

### Tour Manager
- Create and manage tours
- Add/edit merchandise items
- View sales analytics
- Export reports
- Manage show details

### Seller
- View assigned tours
- Update stock counts after shows
- View current inventory

## Deployment

See [CICD.md](./CICD.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. **Link your project**
   ```bash
   vercel link
   ```

2. **Add environment variables in Vercel dashboard**

3. **Deploy**
   ```bash
   vercel --prod
   ```

Or simply push to `main` branch and let GitHub Actions handle it!

## Database Schema

### Core Models

- **User**: Tour managers and sellers with Auth0 integration
- **Tour**: Tour details, dates, and ownership
- **Show**: Individual show information (venue, date, costs)
- **MerchItem**: Merchandise products with images
- **MerchVariant**: Size/type variants (e.g., "T-Shirt - Mens - L")
- **InventoryRecord**: Stock tracking per variant per show

## Development Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes

3. Run verification
   ```bash
   npm run verify
   ```

4. Commit and push
   ```bash
   git add .
   git commit -m "feat: your feature"
   git push origin feature/your-feature
   ```

5. Create a Pull Request
   - CI/CD will automatically run
   - Preview deployment will be created
   - Review and merge

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Troubleshooting

### Prisma Issues

```bash
# Reset Prisma Client
rm -rf node_modules/.prisma
npm run db:generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Auth0 Issues

- Ensure callback URLs are configured in Auth0 dashboard
- Check that `APP_BASE_URL` matches your domain
- Verify Auth0 credentials in `.env`

### Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ for tour managers everywhere
