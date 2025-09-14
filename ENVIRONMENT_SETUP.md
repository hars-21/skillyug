# Environment Configuration Example

This file shows the required environment variables for the Skillyug 2.0 application.

## Backend Environment Variables

Copy the appropriate `.env.development` or `.env.production` file to `.env` in the Backend directory.

### Required Variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing (min 32 characters)
- `AUTH_SECRET`: NextAuth secret key
- `RAZORPAY_KEY` & `RAZORPAY_SECRET`: Payment gateway credentials
- `FRONTEND_URL`: Frontend application URL for CORS

### Optional Variables:
- Email configuration for notifications
- AWS S3 for file uploads
- Redis for caching
- Rate limiting configuration

## Frontend Environment Variables

Copy the appropriate `.env.development` or `.env.production` file to `.env.local` in the frontend-nextjs directory.

### Required Variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_BACKEND_URL`: Backend base URL
- `NEXTAUTH_URL`: Frontend URL for NextAuth
- `NEXTAUTH_SECRET`: NextAuth secret key
- `NEXT_PUBLIC_RAZORPAY_KEY`: Razorpay public key

## Security Notes

1. **Never commit actual `.env` files to version control**
2. Use strong, unique secrets in production (minimum 32 characters)
3. Rotate secrets regularly
4. Use different databases for development and production
5. Enable HTTPS in production
6. Use environment-specific Razorpay keys

## Development Setup

1. Copy `.env.development` to `.env` in both backend and frontend directories
2. Update the database URL and other credentials
3. Start the backend: `cd Backend && pnpm dev`
4. Start the frontend: `cd frontend-nextjs && pnpm dev`

## Production Deployment

1. Copy `.env.production` files and update with production values
2. Set environment variables in your deployment platform
3. Ensure all secrets are properly configured
4. Test the connection between frontend and backend
