# Skillyug Docker Orchestration

This project uses Docker and Docker Compose for containerized development and production deployment.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Make utility (optional, for convenient commands)

### Development Setup

1. **Copy environment file:**
```bash
cp .env.development .env
```

2. **Update environment variables in `.env`:**
   - Database credentials
   - JWT secrets (minimum 32 characters)
   - Razorpay test keys
   - Email configuration (Mailtrap for development)

3. **Start development environment:**
```bash
# Using Make (recommended)
make setup  # One-time setup
make dev    # Start development services

# Or using Docker Compose directly
docker-compose -f docker-compose.dev.yml up --build
```

4. **Run database migrations and seeding:**
```bash
make migrate ENV=dev
make seed ENV=dev
```

5. **Access services:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Prisma Studio: http://localhost:5555
   - API Test Page: http://localhost:3000/api-test

### Production Deployment

1. **Copy production environment file:**
```bash
cp .env.production .env
```

2. **Update production environment variables:**
   - Secure database credentials
   - Strong JWT secrets
   - Live Razorpay keys
   - Production email service
   - Frontend/backend URLs

3. **Deploy:**
```bash
make prod
```

## 📦 Services

### Core Services

1. **Frontend (Next.js)**
   - Port: 3000
   - Hot reload in development
   - Optimized build for production

2. **Backend (Express.js + TypeScript)**
   - Port: 5000
   - Prisma ORM integration
   - JWT authentication
   - Payment processing

3. **Database (PostgreSQL)**
   - Port: 5432
   - Persistent volume storage
   - Health checks

4. **Redis (Caching)**
   - Port: 6379
   - Session storage
   - Caching layer

### Development-Only Services

5. **Prisma Studio**
   - Port: 5555
   - Database management UI

6. **Traefik (Load Balancer)**
   - Port: 80, 443, 8080
   - Reverse proxy
   - SSL termination

## 🛠️ Available Commands

### Using Make (Recommended)

```bash
# Development
make dev          # Start development environment
make setup        # Initial development setup
make studio       # Start Prisma Studio

# Production
make prod         # Start production environment

# Database
make migrate      # Run database migrations
make seed         # Seed database with initial data

# Management
make logs         # View service logs
make status       # Show container status
make restart      # Restart all services
make clean        # Stop and remove all containers/volumes

# Shell access
make shell-backend    # Backend container shell
make shell-frontend   # Frontend container shell  
make shell-db         # Database shell

# Health and maintenance
make health       # Check service health
make backup       # Backup production database
```

### Using Docker Compose Directly

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose up --build -d
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Run migrations
docker-compose run --rm migrate

# Seed database
docker-compose run --rm seed
```

## 🔧 Service Configuration

### Environment Variables

**Required for all environments:**
- `JWT_SECRET`: JWT signing secret (min 32 chars)
- `AUTH_SECRET`: NextAuth secret key
- `RAZORPAY_KEY`: Razorpay API key
- `RAZORPAY_SECRET`: Razorpay secret key

**Database:**
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

**URLs:**
- `FRONTEND_URL`: Frontend application URL
- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend
- `NEXTAUTH_URL`: NextAuth callback URL

### Volumes

- `postgres_data`: PostgreSQL data persistence
- `redis_data`: Redis data persistence  
- `uploads`: File upload storage (backend)

### Networks

- `skillyug-network`: Internal service communication
- Isolated network for security

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check port usage
   lsof -i :3000 -i :5000 -i :5432
   
   # Stop conflicting services
   make down
   ```

2. **Database connection issues:**
   ```bash
   # Check database health
   docker exec skillyug-postgres-dev pg_isready -U skillyug_user
   
   # View database logs
   docker logs skillyug-postgres-dev
   ```

3. **Build failures:**
   ```bash
   # Clean and rebuild
   make clean
   make build ENV=dev
   ```

4. **Environment variables not loaded:**
   - Ensure `.env` file exists
   - Check variable names match exactly
   - Restart containers after changes

### Health Checks

Access the API test page at `http://localhost:3000/api-test` to verify:
- Frontend-backend connectivity
- Database connection
- Razorpay integration
- Authentication services

### Logs and Debugging

```bash
# View all service logs
make logs

# View specific service logs
docker logs skillyug-backend-dev
docker logs skillyug-frontend-dev

# Follow logs in real-time
docker logs -f skillyug-backend-dev
```

## 🚀 Production Considerations

### Security
- Use strong, unique secrets in production
- Enable HTTPS with SSL certificates
- Configure CORS for specific domains
- Use production database with proper backup

### Performance
- Enable Redis caching
- Use CDN for static assets
- Configure proper resource limits
- Monitor service health

### Monitoring
- Set up log aggregation
- Configure health checks
- Monitor database performance
- Track application metrics

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)