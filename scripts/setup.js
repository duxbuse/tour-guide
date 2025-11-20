#!/usr/bin/env node

/**
 * Setup script for Tour Guide application
 * Run with: node scripts/setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, options = {}) {
    console.log(`\n> ${command}`);
    try {
        execSync(command, { stdio: 'inherit', ...options });
        return true;
    } catch (error) {
        console.error(`Error executing: ${command}`);
        return false;
    }
}

async function main() {
    console.log('🎸 Tour Guide - Setup Script\n');
    console.log('This script will help you set up your development environment.\n');

    // Check if .env exists
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found!');
        console.log('Creating .env from template...\n');

        const envTemplate = `# Database (Neon DB)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Auth0
AUTH0_SECRET="use [openssl rand -hex 32] to generate a 32 bytes value"
APP_BASE_URL="http://localhost:3000"
AUTH0_DOMAIN="YOUR_AUTH0_DOMAIN.auth0.com"
AUTH0_CLIENT_ID="YOUR_AUTH0_CLIENT_ID"
AUTH0_CLIENT_SECRET="YOUR_AUTH0_CLIENT_SECRET"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
`;

        fs.writeFileSync(envPath, envTemplate);
        console.log('✅ Created .env file');
        console.log('⚠️  Please update .env with your actual credentials before continuing.\n');

        const continueSetup = await question('Continue with setup? (y/n): ');
        if (continueSetup.toLowerCase() !== 'y') {
            console.log('Setup cancelled. Please update .env and run this script again.');
            rl.close();
            return;
        }
    }

    console.log('\n📦 Installing dependencies...');
    if (!exec('npm install')) {
        console.log('❌ Failed to install dependencies');
        rl.close();
        return;
    }

    console.log('\n🔧 Generating Prisma Client...');
    if (!exec('npx prisma generate')) {
        console.log('❌ Failed to generate Prisma Client');
        rl.close();
        return;
    }

    console.log('\n🗄️  Database setup');
    const setupDb = await question('Do you want to push the schema to your database? (y/n): ');

    if (setupDb.toLowerCase() === 'y') {
        console.log('Pushing schema to database...');
        if (!exec('npx prisma db push')) {
            console.log('❌ Failed to push schema');
        } else {
            console.log('✅ Database schema updated');
        }
    }

    console.log('\n🚀 Vercel setup');
    const setupVercel = await question('Do you want to link this project to Vercel? (y/n): ');

    if (setupVercel.toLowerCase() === 'y') {
        console.log('Linking to Vercel...');
        if (!exec('vercel link')) {
            console.log('⚠️  Vercel linking failed. You can do this later with: vercel link');
        } else {
            console.log('✅ Project linked to Vercel');
            console.log('\n📝 Don\'t forget to:');
            console.log('   1. Add environment variables in Vercel dashboard');
            console.log('   2. Add GitHub secrets for CI/CD (see CICD.md)');
        }
    }

    console.log('\n✨ Setup complete!\n');
    console.log('Next steps:');
    console.log('  1. Update .env with your credentials');
    console.log('  2. Run: npm run dev');
    console.log('  3. Open: http://localhost:3000');
    console.log('  4. Read CICD.md for deployment setup\n');

    rl.close();
}

main().catch(error => {
    console.error('Setup failed:', error);
    rl.close();
    process.exit(1);
});
