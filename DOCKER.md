# Docker Setup for Auth Service

This document explains how to build and run the authentication service using Docker.

## Quick Start

### 1. Build the Docker Image

```bash
# Make the build script executable
chmod +x build-docker.sh

# Run the build script
./build-docker.sh

# Or build manually
docker build -t auth-service:latest .
```

### 2. Run with Docker Compose (Recommended)

```bash
# Full stack (database + auth service with migrations)
docker-compose up -d

# Development (database only, run auth service locally)
docker-compose -f docker-compose.dev.yml up -d
npm run dev

# Production setup
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Run Standalone Container

```bash
# Run with environment variables
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your-password \
  -e DB_NAME=auth_db \
  auth-service:latest
```

## Docker Files Explained

### `Dockerfile`
- **Base Image**: Node.js 18 Alpine (lightweight)
- **Security**: Non-root user (nodejs)
- **Health Check**: Built-in health monitoring
- **Migration Support**: Automatically runs database migrations on startup
- **Optimization**: Multi-stage build with production dependencies only

### `docker-compose.yml` (Full Stack)
- PostgreSQL database with health checks
- Auth service with automatic migrations
- Service dependencies and restart policies
- Environment variable configuration

### `docker-compose.dev.yml` (Development)
- PostgreSQL database only
- For local development with npm run dev
- Volume mounting for development

### `docker-compose.prod.yml` (Production)
- Production-ready PostgreSQL
- Persistent data volumes
- Health checks
- Restart policies
- Network isolation

### `.dockerignore`
- Excludes unnecessary files from Docker context
- Reduces image size
- Improves build performance

## Environment Variables

### Required Variables
```bash
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=auth_db
DB_PORT=5432
```

### Optional Variables
```bash
FRONTEND_URL=https://your-frontend-domain.com
```

## Commands Reference

### Build Commands
```bash
# Build image
docker build -t auth-service:latest .

# Build with custom tag
docker build -t auth-service:v1.0.0 .

# Build with no cache
docker build --no-cache -t auth-service:latest .
```

### Run Commands
```bash
# Run container
docker run -p 3001:3001 auth-service:latest

# Run in background
docker run -d -p 3001:3001 --name auth-service auth-service:latest

# Run with environment file
docker run -p 3001:3001 --env-file .env auth-service:latest
```

### Docker Compose Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f auth-service

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

### Management Commands
```bash
# View running containers
docker ps

# View logs
docker logs auth-service

# Execute shell in container
docker exec -it auth-service sh

# Stop container
docker stop auth-service

# Remove container
docker rm auth-service

# Remove image
docker rmi auth-service:latest
```

## Production Deployment

### 1. Environment Setup
```bash
# Create production environment file
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

### 2. Deploy with Docker Compose
```bash
# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Health Monitoring
```bash
# Check service health
curl http://localhost:3001/health

# Check database connection
docker exec -it auth-postgres psql -U postgres -d auth_db -c "SELECT COUNT(*) FROM users;"
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use Docker secrets for sensitive data in production
- Rotate database passwords regularly

### 2. Network Security
- Use custom networks for service isolation
- Configure firewall rules
- Use HTTPS in production

### 3. Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Test database connection
docker exec -it auth-postgres psql -U postgres -c "SELECT 1;"
```

#### 2. Port Already in Use
```bash
# Check what's using the port
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use different port
docker run -p 3002:3001 auth-service:latest
```

#### 3. Permission Denied
```bash
# Make scripts executable
chmod +x build-docker.sh

# Check file permissions
ls -la build-docker.sh
```

### Debug Commands
```bash
# Run container with debug shell
docker run -it --entrypoint sh auth-service:latest

# Check container logs
docker logs --tail 100 auth-service

# Inspect container
docker inspect auth-service
```

## Performance Optimization

### 1. Image Size Optimization
- Uses Alpine Linux (smaller base image)
- Multi-stage builds
- `.dockerignore` excludes unnecessary files

### 2. Runtime Optimization
- Non-root user for security
- Health checks for reliability
- Proper signal handling

### 3. Database Optimization
- Connection pooling
- Indexed queries
- Automatic cleanup of expired sessions
