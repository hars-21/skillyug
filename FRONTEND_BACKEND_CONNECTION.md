# Frontend-Backend Connection Guide

This guide provides a comprehensive overview of how to connect the Skillyug 2.0 frontend (Next.js) with the backend (Express.js + Prisma).

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- Razorpay account (for payments)

### 2. Environment Setup

#### Backend (.env)
```bash
cp Backend/.env.development Backend/.env
# Edit Backend/.env with your configuration
```

#### Frontend (.env.local)
```bash
cp frontend-nextjs/.env.development frontend-nextjs/.env.local
# Edit frontend-nextjs/.env.local with your configuration
```

### 3. Start Services

#### Terminal 1 - Backend
```bash
cd Backend
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

#### Terminal 2 - Frontend
```bash
cd frontend-nextjs
pnpm install
pnpm dev
```

### 4. Test Connection
Visit `http://localhost:3000/api-test` to verify all connections work properly.

## 🔧 Architecture Overview

### Communication Flow
```
Frontend (Next.js) → API Client → Backend (Express.js) → Database (PostgreSQL)
     ↓                   ↓              ↓                    ↓
Port 3000          Axios/Fetch     Port 5000            Port 5432
```

### Key Components

#### 1. API Client (`/src/lib/api.ts`)
- Centralized HTTP client with Axios
- Automatic authentication header injection
- Error handling and retry logic
- Type-safe API calls

#### 2. Authentication (`/src/lib/auth.ts`)
- NextAuth.js integration
- JWT token management
- Session persistence
- Role-based access control

#### 3. CORS Configuration (`Backend/src/index.ts`)
- Multi-origin support
- Credentials enabled
- Security headers with Helmet
- Rate limiting

#### 4. Error Handling
- Global error middleware in backend
- Standardized API responses
- Client-side error boundaries
- User-friendly error messages

## 🛡️ Security Features

### Backend Security
- Helmet.js for security headers
- Rate limiting (general + auth-specific)
- Input validation with Zod
- SQL injection protection with Prisma
- CORS protection
- JWT token validation

### Frontend Security
- XSS protection with Next.js
- CSRF protection with NextAuth
- Secure cookie handling
- Environment variable validation
- API request sanitization

## 📡 API Integration

### Authentication Flow
```typescript
// Frontend login
const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  userType: 'STUDENT'
});

// Backend validation
// → JWT token generation
// → Session creation
// → User data return
```

### API Request Pattern
```typescript
// Using the API client
import { courseAPI } from '@/lib/api';

const courses = await courseAPI.getAll({
  category: 'programming',
  limit: 10
});
```

### Error Handling Pattern
```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  const message = handleApiError(error);
  // Display user-friendly error
}
```

## 🔄 State Management

### Session State
- NextAuth.js manages authentication state
- Session data available throughout the app
- Automatic token refresh
- Protected route handling

### API State
- React Query for server state (recommended)
- Error and loading states
- Cache invalidation
- Optimistic updates

## 📊 Monitoring & Debugging

### Development Tools
- API test page at `/api-test`
- Next.js dev tools
- Prisma Studio for database
- Network tab for API debugging

### Production Monitoring
- Error tracking with Sentry (configured)
- Performance monitoring
- API response time tracking
- User session analytics

## 🚀 Deployment

### Environment-Specific Configuration

#### Development
- Local PostgreSQL
- Mailtrap for emails
- Test Razorpay keys
- Debug mode enabled

#### Production
- Hosted PostgreSQL (Neon, Supabase, etc.)
- Production email service
- Live Razorpay keys
- Error reporting enabled

### Deployment Platforms

#### Backend (API)
- **Vercel**: Zero-config deployment
- **Railway**: Full-stack deployment
- **Render**: Container deployment
- **AWS/GCP**: Cloud deployment

#### Frontend
- **Vercel**: Recommended for Next.js
- **Netlify**: Static + API routes
- **AWS Amplify**: Full-stack deployment

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS origins updated
- [ ] SSL certificates configured
- [ ] Monitoring tools setup
- [ ] Error tracking enabled
- [ ] Performance monitoring active

## 🐛 Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if backend is running
curl http://localhost:5000/api/test

# Check environment variables
echo $NEXT_PUBLIC_API_URL
```

#### CORS Errors
```typescript
// Verify CORS configuration in backend
const corsOptions = {
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
};
```

#### Authentication Issues
```typescript
// Check NextAuth configuration
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' }
};
```

#### Database Connectivity
```bash
# Test database connection
cd Backend
pnpm db:studio

# Check Prisma schema
pnpm db:reset
pnpm db:migrate
```

### Debug Commands
```bash
# Backend logs
cd Backend && pnpm dev

# Frontend logs
cd frontend-nextjs && pnpm dev

# Database inspection
cd Backend && pnpm db:studio

# API testing
curl -X GET http://localhost:5000/api/test
```

## 📝 API Documentation

### Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/verify-otp` - OTP verification

#### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin/mentor)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

#### Payments
- `GET /api/getKey` - Get Razorpay key
- `POST /api/checkout` - Create payment order
- `POST /api/paymentverification` - Verify payment

#### Purchases
- `GET /api/purchases` - List user purchases
- `POST /api/purchases` - Record purchase
- `GET /api/purchases/user/:id` - User-specific purchases

### Response Format
```typescript
interface ApiResponse<T> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  errors?: any;
  meta?: {
    timestamp: string;
    pagination?: PaginationMeta;
  };
}
```

## 🔗 External Integrations

### Razorpay Payment Gateway
```typescript
// Configuration
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
  amount: amount * 100, // Amount in paise
  currency: 'INR',
  name: 'Skillyug',
  description: 'Course Purchase',
  order_id: order.id,
  handler: handlePaymentSuccess,
};
```

### Email Service
- Development: Mailtrap
- Production: SendGrid/AWS SES
- Templates for OTP, welcome, reset password

### File Storage (Optional)
- AWS S3 for course materials
- Image optimization with Next.js
- CDN integration for performance

## 📈 Performance Optimization

### Frontend
- Image optimization with Next.js
- Code splitting and lazy loading
- API response caching
- Bundle size optimization

### Backend
- Database query optimization
- Response compression
- Caching with Redis (optional)
- Rate limiting for protection

### Database
- Proper indexing
- Connection pooling
- Query optimization
- Regular maintenance

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run connectivity tests
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Test coverage requirements

For more detailed information, check the individual README files in the Backend and frontend-nextjs directories.
