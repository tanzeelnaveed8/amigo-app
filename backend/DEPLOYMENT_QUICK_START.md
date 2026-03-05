# 🚀 Quick Deployment Guide - AWS EC2

## Fastest Way to Deploy (5 Steps)

### 1. Launch EC2 Instance
- **AMI**: Ubuntu 22.04 LTS
- **Instance Type**: t3.small (or t2.micro for testing)
- **Security Group**: 
  - SSH (22) - Your IP
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
  - Custom TCP (9090) - 0.0.0.0/0

### 2. Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 3. Upload Files
```bash
# On your local machine
cd /path/to/amigo_backend
scp -i your-key.pem deploy.sh ubuntu@your-ec2-ip:~/
scp -i your-key.pem -r . ubuntu@your-ec2-ip:~/amigo_backend
```

### 4. Run Deployment Script
```bash
# On EC2
chmod +x deploy.sh
./deploy.sh
```

### 5. Configure Environment
```bash
cd ~/amigo_backend
nano .env
# Fill in your MongoDB URI, AWS keys, JWT secret, etc.
pm2 restart "Amigo BE"
```

## ✅ Done!

Your API will be available at:
- `http://your-ec2-ip/api/deployment`

## 🔧 Common Commands

```bash
# View logs
pm2 logs

# Restart app
pm2 restart "Amigo BE"

# Check status
pm2 status

# Update app
cd ~/amigo_backend
git pull
npm install
pm2 restart "Amigo BE"
```

## 📝 Required Environment Variables

Create `.env` file with:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Random secret key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `PORT=9090` (default)

See `README_DEPLOYMENT.md` for full details.
