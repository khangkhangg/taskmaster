# TaskMaster Deployment Guide

This guide covers multiple deployment strategies for the TaskMaster platform, from local development to production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development with Docker](#local-development-with-docker)
3. [Production Deployment Options](#production-deployment-options)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Security Best Practices](#security-best-practices)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v18 or higher
- **MongoDB**: v7.0 or higher
- **Redis**: v7.0 or higher
- **Docker**: v24.0 or higher (optional, but recommended)
- **Docker Compose**: v2.20 or higher (optional)
- **Nginx**: Latest stable version (for production)
- **PM2**: Global installation for process management

### Optional Services

- **Firebase Admin SDK**: For push notifications
- **Email Service**: SMTP server (Gmail, SendGrid, etc.)

---

## Local Development with Docker

### Quick Start (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/taskmaster.git
cd taskmaster

# Copy environment file
cp backend/.env.example backend/.env

# Edit environment variables
nano backend/.env

# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Service URLs

- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Docker Compose Services

The `docker-compose.yml` includes:
- MongoDB database with persistent storage
- Redis cache
- Backend API server
- Nginx reverse proxy (optional, use with `--profile production`)

---

## Production Deployment Options

### Option 1: Docker Deployment (Recommended)

#### 1. Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create deployment user
sudo adduser deploy
sudo usermod -aG docker deploy
```

#### 2. Clone and Configure

```bash
# Switch to deploy user
su - deploy

# Clone repository
git clone https://github.com/yourusername/taskmaster.git
cd taskmaster

# Setup environment
cp backend/.env.example backend/.env
nano backend/.env  # Edit production values
```

#### 3. Deploy with Docker Compose

```bash
# Build and start services
docker-compose --profile production up -d --build

# Check service health
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 2: PM2 Process Manager

#### 1. Install Dependencies

```bash
# Install Node.js 18
curl -fSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MongoDB
# Follow: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

# Install Redis
sudo apt install redis-server
```

#### 2. Setup Application

```bash
# Clone repository
git clone https://github.com/yourusername/taskmaster.git
cd taskmaster/backend

# Install dependencies
npm ci --only=production

# Setup environment
cp .env.example .env
nano .env  # Configure production settings

# Create necessary directories
mkdir -p uploads logs exports
```

#### 3. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor application
pm2 monit

# View logs
pm2 logs taskmaster-api
```

### Option 3: Traditional Server Deployment

#### 1. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx

# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/taskmaster
sudo ln -s /etc/nginx/sites-available/taskmaster /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 2. SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.taskmaster.com

# Auto-renewal is configured automatically
```

---

## Environment Configuration

### Production Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://username:password@localhost:27017/taskmaster?authSource=admin

# Authentication
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app-specific-password>
EMAIL_FROM=TaskMaster <noreply@taskmaster.com>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>

# Firebase (Optional)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# URLs
FRONTEND_URL=https://taskmaster.com
BACKEND_URL=https://api.taskmaster.com
```

### Generate Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
openssl rand -base64 32
```

---

## Database Setup

### MongoDB Configuration

#### 1. Secure MongoDB

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["root"]
})

# Create application user
use taskmaster
db.createUser({
  user: "taskmaster_user",
  pwd: "secure_app_password",
  roles: [
    { role: "readWrite", db: "taskmaster" }
  ]
})
```

#### 2. Enable Authentication

Edit `/etc/mongod.conf`:

```yaml
security:
  authorization: enabled
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

#### 3. Create Indexes (Optional but Recommended)

```bash
# Connect to database
mongosh -u taskmaster_user -p --authenticationDatabase taskmaster

use taskmaster

# User indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 })
db.users.createIndex({ location: 1 })

# Task indexes
db.tasks.createIndex({ status: 1, createdAt: -1 })
db.tasks.createIndex({ category: 1 })
db.tasks.createIndex({ location: 1 })

# Message indexes
db.messages.createIndex({ task: 1, createdAt: 1 })
db.messages.createIndex({ sender: 1, recipient: 1 })
```

### Redis Configuration

```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Set password
requirepass your_strong_redis_password

# Set persistence
appendonly yes

# Restart Redis
sudo systemctl restart redis
```

---

## Security Best Practices

### 1. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow MongoDB (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 27017

# Allow Redis (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 6379

# Enable firewall
sudo ufw enable
```

### 2. Environment Security

- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Rotate secrets regularly
- Use environment-specific secrets
- Enable 2FA for all service accounts

### 3. Application Security

- Keep dependencies updated: `npm audit fix`
- Use HTTPS in production (Let's Encrypt)
- Enable rate limiting (already configured)
- Monitor logs for suspicious activity
- Implement proper CORS policies

### 4. Database Security

- Enable authentication
- Use strong passwords
- Limit network access
- Enable encryption at rest (MongoDB Enterprise)
- Regular backups

---

## Monitoring and Maintenance

### Application Monitoring

#### PM2 Monitoring

```bash
# Check status
pm2 status

# Monitor in real-time
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart taskmaster-api
```

#### Docker Monitoring

```bash
# Check container health
docker-compose ps

# View resource usage
docker stats

# View logs
docker-compose logs -f backend

# Restart services
docker-compose restart backend
```

### Log Management

Logs are stored in:
- **Application logs**: `backend/logs/`
- **PM2 logs**: `~/.pm2/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **Docker logs**: `docker-compose logs`

### Database Backups

#### MongoDB Backup Script

```bash
#!/bin/bash
# backup-mongodb.sh

BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

mongodump \
  --uri="mongodb://username:password@localhost:27017/taskmaster?authSource=admin" \
  --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Schedule with cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-mongodb.sh
```

### Health Checks

```bash
# API health check
curl http://localhost:5000/health

# MongoDB health
mongosh --eval "db.adminCommand('ping')"

# Redis health
redis-cli ping
```

---

## CI/CD Pipeline

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Runs tests on MongoDB and Redis services
2. Builds Docker images
3. Performs security scanning with Trivy
4. Checks code quality
5. Deploys to production on push to `main`

### Setup Required Secrets

In GitHub repository settings, add:

- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `PRODUCTION_HOST`: Production server IP/domain
- `PRODUCTION_USER`: SSH user
- `PRODUCTION_SSH_KEY`: SSH private key

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

#### MongoDB Connection Failed

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

#### Redis Connection Failed

```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping

# Check logs
sudo tail -f /var/log/redis/redis-server.log
```

#### Docker Container Won't Start

```bash
# View detailed logs
docker-compose logs backend

# Rebuild containers
docker-compose up -d --build --force-recreate

# Clean Docker system
docker system prune -a
```

#### Permission Issues

```bash
# Fix upload directory permissions
sudo chown -R deploy:deploy uploads logs exports

# Fix Docker socket permissions
sudo usermod -aG docker $USER
```

---

## Performance Optimization

### 1. MongoDB Optimization

```javascript
// Enable index usage
db.tasks.find({ status: 'open' }).explain('executionStats')

// Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### 2. Redis Configuration

```conf
# /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 3. Node.js Optimization

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048" pm2 start ecosystem.config.js
```

### 4. Nginx Caching

Add to `nginx.conf`:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/tasks {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... other proxy settings
}
```

---

## Scaling Strategies

### Horizontal Scaling

1. **Load Balancing with Nginx**
   - Add multiple backend servers to upstream block
   - Use `least_conn` or `ip_hash` algorithms

2. **Database Replication**
   - Setup MongoDB replica set
   - Read from secondaries for read-heavy operations

3. **Redis Cluster**
   - Setup Redis cluster for distributed caching
   - Use Redis Sentinel for high availability

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database indexes
- Enable PM2 cluster mode (already configured)

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/taskmaster/issues
- Documentation: See README.md
- Email: support@taskmaster.com

---

## License

MIT License - See LICENSE file for details
