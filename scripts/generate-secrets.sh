#!/bin/bash

# Skillyug 2.0 - Secure Environment Configuration Generator
# This script generates cryptographically secure secrets for production use

echo "🔐 Generating secure secrets for Skillyug 2.0..."

# Generate secure random secrets
JWT_SECRET=$(openssl rand -base64 32)
AUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Create secure .env file
cat > .env.secure << EOF
# ===== SECURE PRODUCTION ENVIRONMENT =====
# Generated on: $(date)

# ===== DATABASE =====
POSTGRES_DB=skillyug
POSTGRES_USER=skillyug_user
POSTGRES_PASSWORD=$(openssl rand -base64 24)

# ===== APPLICATION SECRETS =====
JWT_SECRET=${JWT_SECRET}
AUTH_SECRET=${AUTH_SECRET}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# ===== PAYMENT GATEWAY =====
# IMPORTANT: Replace with your actual Razorpay keys
RAZORPAY_KEY=your_live_razorpay_key_here
RAZORPAY_SECRET=your_live_razorpay_secret_here
NEXT_PUBLIC_RAZORPAY_KEY=your_live_razorpay_key_here

# ===== FRONTEND URLs =====
FRONTEND_URL=https://skillyug.com
NEXT_PUBLIC_API_URL=https://api.skillyug.com/api
NEXT_PUBLIC_BACKEND_URL=https://api.skillyug.com
NEXTAUTH_URL=https://skillyug.com

# ===== EMAIL CONFIGURATION =====
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key_here

# ===== AWS S3 =====
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=skillyug-uploads

# ===== AI RECOMMENDATION ENGINE =====
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# ===== ENVIRONMENT =====
NODE_ENV=production
EOF

echo "✅ Secure environment file created: .env.secure"
echo "⚠️  IMPORTANT: "
echo "   1. Replace placeholder API keys with actual values"
echo "   2. Move .env.secure to .env in production"
echo "   3. Never commit .env files to version control"
echo "   4. Set proper file permissions: chmod 600 .env"

# Set secure permissions
chmod 600 .env.secure

echo "🔒 File permissions set to 600 (owner read/write only)"
