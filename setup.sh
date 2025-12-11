#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Leads Backend Setup${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

# Install dependencies
echo -e "\n${BLUE}Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "\n${BLUE}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}Please update .env with your database credentials${NC}"
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=postgresql://" .env && ! grep -q "DATABASE_URL=mysql://" .env; then
    echo -e "\n${YELLOW}WARNING: DATABASE_URL is not properly configured in .env${NC}"
    echo -e "${YELLOW}Please configure your database connection${NC}"
fi

# Generate Prisma Client
echo -e "\n${BLUE}Generating Prisma Client...${NC}"
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Failed to generate Prisma Client${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Build TypeScript
echo -e "\n${BLUE}Building TypeScript...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Failed to build TypeScript${NC}"
    exit 1
fi

echo -e "${GREEN}✓ TypeScript built successfully${NC}"

echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}Setup Complete!${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Configure your database in .env"
echo -e "2. Run migrations: ${GREEN}npm run prisma:migrate${NC}"
echo -e "3. (Optional) Seed database: ${GREEN}npm run prisma:seed${NC}"
echo -e "4. Start development server: ${GREEN}npm run dev${NC}"
echo -e "\n${YELLOW}Or use Docker:${NC}"
echo -e "docker-compose up -d"
