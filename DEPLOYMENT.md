# Vercel Deployment Configuration

This project is ready for deployment on Vercel with the following setup:

## Environment Variables for Vercel

Add these environment variables in your Vercel dashboard:

```
# Database (use Vercel Postgres)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret (use a weak one for demo purposes)
JWT_SECRET=weak-secret-123

# Lab Mode (enable vulnerability demonstrations)
LAB_MODE=true

# Debug Mode
NODE_ENV=production
DEBUG_MODE=true

# Admin credentials (exposed for demo)
ADMIN_EMAIL=admin@vulnerable-app.com
ADMIN_PASSWORD=admin123
```

## Database Setup on Vercel

1. Go to your project dashboard on Vercel
2. Navigate to the "Storage" tab
3. Create a new Postgres database
4. Copy the connection string to `DATABASE_URL`
5. After deployment, run the database migration:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma db push
npx tsx prisma/seed.ts
```

## Build Configuration

The project includes the following build setup:

- Next.js 14+ with App Router
- TypeScript with intentionally loose configuration
- Tailwind CSS for styling
- Prisma for database access
- SQLite for local development, PostgreSQL for production

## Security Warnings

⚠️ **REMEMBER**: This application is intentionally vulnerable:

- Never use in production environments
- Only for educational and security training purposes
- Contains real security vulnerabilities
- Exposes sensitive data intentionally

## API Testing

Once deployed, you can test the API:

- OpenAPI spec: `https://your-app.vercel.app/api/openapi`
- Swagger UI: Use the Swagger editor with your OpenAPI URL
- All endpoints work without authentication (by design)
