# Deployment Guide

## Option 1: Quick Deploy (PM2 on Linux Server)

### Prerequisites
- Node.js 18+ installed
- PM2 installed globally (`npm install -g pm2`)

### Steps

1. **Build the app:**
```bash
cd ~/clawd/bcash
npm run build
```

2. **Copy to server:**
```bash
# From local machine
rsync -avz --exclude 'node_modules' \
  ~/clawd/bcash/ \
  user@server:/var/www/bcash/
```

3. **On the server:**
```bash
cd /var/www/bcash
npm install --production
npm run build
```

4. **Start with PM2:**
```bash
pm2 start npm --name "bcash" -- start
pm2 save
pm2 startup  # Follow instructions to enable autostart
```

5. **Set up Nginx reverse proxy:**
```nginx
# /etc/nginx/sites-available/bcash
server {
    listen 80;
    server_name bcash.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/bcash /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Option 2: Docker (Recommended for Production)

### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app files
COPY . .

# Build app
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  bcash:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

### Deploy
```bash
docker-compose up -d
```

## Option 3: Vercel (Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd ~/clawd/bcash
vercel

# Follow prompts
```

**Note:** Data persistence with Vercel requires external storage (S3, etc.) since filesystem is ephemeral.

## Data Backup

Since data is stored in JSON files, backup is simple:

```bash
# Manual backup
tar -czf bcash-data-$(date +%Y%m%d).tar.gz data/

# Automated daily backup (crontab)
0 2 * * * cd /var/www/bcash && tar -czf ~/backups/bcash-data-$(date +\%Y\%m\%d).tar.gz data/
```

## Environment Variables

Create `.env.local` for production:

```env
NODE_ENV=production
```

## Security Checklist

- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set up firewall (ufw/iptables)
- [ ] Regular backups
- [ ] Consider basic auth if exposing publicly
- [ ] Monitor disk space (data directory)

## Updating

```bash
# On server
cd /var/www/bcash
git pull  # or rsync new files
npm install
npm run build
pm2 restart bcash
```

## Monitoring

```bash
# View logs
pm2 logs bcash

# Monitor
pm2 monit

# App info
pm2 info bcash
```

## Troubleshooting

### Port already in use
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Permission issues
```bash
# Fix data directory permissions
chown -R www-data:www-data /var/www/bcash/data
chmod -R 755 /var/www/bcash/data
```

### Build fails
```bash
# Clear cache
rm -rf .next
npm run build
```

## Performance Tips

- Enable Nginx caching for static assets
- Use HTTP/2
- Enable gzip compression
- Monitor memory usage (PM2 restart on threshold)

---

**Recommended:** Option 1 (PM2) for simple deployments, Option 2 (Docker) for production.
