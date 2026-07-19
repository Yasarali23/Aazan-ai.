#!/bin/bash

# 🚀 AAZAN AI - QUICK LAUNCH SCRIPT
# Run this script to launch AAZAN AI in seconds!

echo "🚀 AAZAN AI - Quick Launch"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not installed. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo -e "${BLUE}📦 Step 1: Installing Dependencies${NC}"
npm install

echo ""
echo -e "${BLUE}🗄️  Step 2: Setting up Database${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from .env.example${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}📝 Please edit .env.local with your API keys${NC}"
    echo -e "${YELLOW}Then run this script again${NC}"
    nano .env.local
fi

# Check for docker-compose
if command -v docker-compose &> /dev/null; then
    echo -e "${BLUE}🐳 Starting Docker services...${NC}"
    docker-compose up -d
    sleep 10
else
    echo -e "${YELLOW}⚠️  Docker not found. Make sure PostgreSQL is running${NC}"
fi

echo ""
echo -e "${BLUE}🔄 Step 3: Running Database Migrations${NC}"
npx prisma db push

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}🚀 Starting Development Server...${NC}"
npm run dev

echo ""
echo -e "${GREEN}🎉 AAZAN AI is running!${NC}"
echo -e "${GREEN}Visit: http://localhost:3000${NC}"
