#!/bin/bash

# Amigo Backend - Automated EC2 Deployment Script
# This script automates the deployment process on Ubuntu EC2 instances

set -e  # Exit on error

echo "🚀 Starting Amigo Backend Deployment..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Use a regular user with sudo privileges.${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo -e "${YELLOW}📦 Installing essential packages...${NC}"
sudo apt install -y curl git build-essential

# Install Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}✓ Node.js already installed: $(node --version)${NC}"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Nginx...${NC}"
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi

# Check if application directory exists
APP_DIR="$HOME/amigo_backend"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}📦 Application directory not found.${NC}"
    echo -e "${YELLOW}Please ensure you've cloned/uploaded the application to: $APP_DIR${NC}"
    echo -e "${YELLOW}You can clone it with: git clone https://github.com/Ashishrajputz/amigo_backend.git${NC}"
    exit 1
fi

cd "$APP_DIR"

# Install dependencies
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
if [ -f "yarn.lock" ]; then
    yarn install
else
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${RED}⚠️  IMPORTANT: Please edit .env file with your actual configuration!${NC}"
        echo -e "${YELLOW}Run: nano .env${NC}"
    else
        echo -e "${RED}❌ .env.example not found. Please create .env file manually.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

# Create logs directory for PM2
mkdir -p logs

# Stop existing PM2 process if running
if pm2 list | grep -q "Amigo BE"; then
    echo -e "${YELLOW}🔄 Stopping existing PM2 process...${NC}"
    pm2 stop "Amigo BE" || true
    pm2 delete "Amigo BE" || true
fi

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
echo -e "${YELLOW}⚙️  Configuring PM2 to start on boot...${NC}"
STARTUP_CMD=$(pm2 startup | grep -o "sudo.*")
if [ ! -z "$STARTUP_CMD" ]; then
    eval $STARTUP_CMD
fi

# Configure Nginx
echo -e "${YELLOW}⚙️  Configuring Nginx...${NC}"
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/amigo-backend
    sudo ln -sf /etc/nginx/sites-available/amigo-backend /etc/nginx/sites-enabled/
    
    # Remove default nginx site if exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx configured${NC}"
else
    echo -e "${YELLOW}⚠️  nginx.conf not found. Skipping Nginx configuration.${NC}"
fi

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 'Nginx Full' || true
sudo ufw allow ssh || true
sudo ufw --force enable || true

# Display status
echo ""
echo -e "${GREEN}=========================================="
echo -e "✅ Deployment Complete!"
echo -e "==========================================${NC}"
echo ""
echo -e "${GREEN}Application Status:${NC}"
pm2 status
echo ""
echo -e "${GREEN}Useful Commands:${NC}"
echo -e "  View logs:        ${YELLOW}pm2 logs${NC}"
echo -e "  Restart app:      ${YELLOW}pm2 restart \"Amigo BE\"${NC}"
echo -e "  Stop app:         ${YELLOW}pm2 stop \"Amigo BE\"${NC}"
echo -e "  Monitor:          ${YELLOW}pm2 monit${NC}"
echo ""
echo -e "${GREEN}Test your API:${NC}"
echo -e "  Local:  ${YELLOW}curl http://localhost:9090/api/deployment${NC}"
echo -e "  Public: ${YELLOW}curl http://$(curl -s ifconfig.me)/api/deployment${NC}"
echo ""
