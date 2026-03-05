# Amigo Backend - AWS EC2 Deployment Guide

This guide will help you deploy the Amigo backend application on AWS EC2 in the easiest and most efficient way.

## 📋 Prerequisites

- AWS Account
- EC2 Instance (Ubuntu 20.04 LTS or 22.04 LTS recommended)
- MongoDB database (MongoDB Atlas or self-hosted)
- Domain name (optional, for production)
- AWS S3 bucket (for file storage)
- Firebase Admin SDK credentials

## 🚀 Quick Start (Easiest Method)

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS** (or 20.04 LTS)
3. Select instance type: **t2.micro** (free tier) or **t3.small** (recommended for production)
4. Configure Security Group:
   - **SSH (22)** - Your IP only
   - **HTTP (80)** - 0.0.0.0/0
   - **HTTPS (443)** - 0.0.0.0/0
   - **Custom TCP (9090)** - 0.0.0.0/0 (or your load balancer IP)
5. Create/Select Key Pair for SSH access
6. Launch instance

### Step 2: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Run Automated Deployment Script

On your local machine, copy the deployment script to EC2:

```bash
# From your local machine
scp -i your-key.pem deploy.sh ubuntu@your-ec2-public-ip:~/
scp -i your-key.pem .env.example ubuntu@your-ec2-public-ip:~/
```

Then on EC2:

```bash
chmod +x deploy.sh
./deploy.sh
```

**OR** manually follow the steps below.

## 📝 Manual Deployment Steps

### Step 1: Update System and Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential
```

### Step 2: Install Node.js (v18 or v20 LTS)

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 4: Install Nginx (Reverse Proxy - Optional but Recommended)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5: Clone Your Repository

```bash
cd ~
git clone https://github.com/Ashishrajputz/amigo_backend.git
cd amigo_backend
```

**OR** if you want to upload from local:

```bash
# On local machine
cd /path/to/amigo_backend
tar -czf amigo_backend.tar.gz --exclude='node_modules' --exclude='.git' .
scp -i your-key.pem amigo_backend.tar.gz ubuntu@your-ec2-public-ip:~/

# On EC2
cd ~
tar -xzf amigo_backend.tar.gz
cd amigo_backend
```

### Step 6: Install Dependencies

```bash
npm install
# OR
yarn install
```

### Step 7: Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**

```env
# Server Configuration
NODE_ENV=production
PORT=9090

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amigo?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Firebase Admin SDK (if using Firebase)
FIREBASE_PROJECT_ID=your-firebase-project-id
# Upload firebase-service-account.json to server

# Email Configuration (if using nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OTP Service (if using MSG91 or similar)
OTP_API_KEY=your-otp-service-api-key
```

### Step 8: Upload Firebase Service Account File

```bash
# On local machine
scp -i your-key.pem firebase-service-account.json ubuntu@your-ec2-public-ip:~/amigo_backend/

# OR use the existing file if it's already in the repo
```

### Step 9: Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Run the command that PM2 outputs (usually something like: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu)
```

### Step 10: Configure Nginx (Reverse Proxy)

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/amigo-backend
```

Paste the configuration from `nginx.conf` file (see below), then:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/amigo-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 11: Configure Firewall

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'

# Allow SSH
sudo ufw allow ssh

# Enable firewall
sudo ufw enable
```

### Step 12: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs

# Test API endpoint
curl http://localhost:9090/api/deployment
curl http://your-ec2-ip/api/deployment
```

## 🔧 PM2 Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs
pm2 logs --lines 100

# Restart application
pm2 restart "Amigo BE"

# Stop application
pm2 stop "Amigo BE"

# Delete application from PM2
pm2 delete "Amigo BE"

# Monitor resources
pm2 monit
```

## 🔒 Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use environment variables** - Never commit `.env` file

3. **Configure Security Groups** - Only allow necessary ports

4. **Use HTTPS** - Set up SSL certificate with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

5. **Regular backups** - Backup your MongoDB database regularly

6. **Monitor logs:**
   ```bash
   pm2 logs --lines 50
   tail -f /var/log/nginx/error.log
   ```

## 📊 Monitoring & Maintenance

### View Application Logs

```bash
# PM2 logs
pm2 logs "Amigo BE"

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check System Resources

```bash
# CPU and Memory
htop
# OR
top

# Disk space
df -h

# PM2 monitoring
pm2 monit
```

### Update Application

```bash
cd ~/amigo_backend
git pull origin main  # or your branch
npm install
pm2 restart "Amigo BE"
```

## 🐛 Troubleshooting

### Application won't start

1. Check PM2 logs: `pm2 logs`
2. Check environment variables: `cat .env`
3. Check MongoDB connection
4. Check port availability: `sudo netstat -tulpn | grep 9090`

### Nginx 502 Bad Gateway

1. Check if app is running: `pm2 status`
2. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify backend is listening on correct port

### MongoDB Connection Issues

1. Verify MongoDB URI in `.env`
2. Check MongoDB Atlas IP whitelist (add EC2 IP)
3. Test connection: `mongosh "your-connection-string"`

### Socket.IO Issues

1. Ensure WebSocket support in Nginx config
2. Check firewall rules
3. Verify Socket.IO client connects to correct URL

## 📦 Alternative: Using Systemd (Instead of PM2)

If you prefer systemd over PM2, see `amigo-backend.service` file for configuration.

## 🔄 Auto-Deployment with GitHub Actions (Optional)

You can set up CI/CD pipeline to automatically deploy on git push. This requires:
- GitHub Actions workflow
- SSH key setup
- Deployment script on server

## 📞 Support

For issues or questions, check:
- Application logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -u amigo-backend` (if using systemd)

---

**Deployment completed!** Your API should now be accessible at:
- `http://your-ec2-ip/api/deployment`
- `http://yourdomain.com/api/deployment` (if domain configured)
