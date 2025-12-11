#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   Leads Backend Installer                  ║"
echo "║               Node.js + Express + PostgreSQL              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Function to print section
print_section() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check Node.js
print_section "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION found"

# Check npm
print_section "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION found"

# Choose installation method
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Choose installation method:${NC}"
echo "1) Local (without Docker)"
echo "2) Docker Compose (recommended)"
echo "3) Exit"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_section "Starting Local Installation..."
        
        # Install dependencies
        print_section "Installing dependencies..."
        npm install
        
        if [ $? -ne 0 ]; then
            print_error "Failed to install dependencies"
            exit 1
        fi
        print_success "Dependencies installed"
        
        # Copy .env if not exists
        if [ ! -f .env ]; then
            print_section "Creating .env file..."
            cp .env.example .env
            print_success ".env file created"
            print_warning "Please configure your database in .env"
        fi
        
        # Check if database URL is set
        print_section "Checking database configuration..."
        if grep -q "DATABASE_URL=postgresql://" .env || grep -q "DATABASE_URL=mysql://" .env; then
            print_success "Database URL is configured"
        else
            print_warning "Database URL not configured. Update .env file before running migrations."
        fi
        
        # Generate Prisma Client
        print_section "Generating Prisma Client..."
        npm run prisma:generate
        
        if [ $? -ne 0 ]; then
            print_error "Failed to generate Prisma Client"
            exit 1
        fi
        print_success "Prisma Client generated"
        
        # Build
        print_section "Building TypeScript..."
        npm run build
        
        if [ $? -ne 0 ]; then
            print_error "Failed to build TypeScript"
            exit 1
        fi
        print_success "TypeScript build completed"
        
        echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ Installation Complete!${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
        
        echo "Next steps:"
        echo "1. Configure database in .env"
        echo -e "   ${YELLOW}Edit: DATABASE_URL=postgresql://user:password@localhost:5432/leads_db${NC}"
        echo ""
        echo "2. Run migrations:"
        echo -e "   ${YELLOW}npm run prisma:migrate${NC}"
        echo ""
        echo "3. (Optional) Seed database with test data:"
        echo -e "   ${YELLOW}npm run prisma:seed${NC}"
        echo ""
        echo "4. Start development server:"
        echo -e "   ${YELLOW}npm run dev${NC}"
        echo ""
        echo "Server will be available at: ${BLUE}http://localhost:3000${NC}"
        echo "Health check: ${BLUE}http://localhost:3000/api/health${NC}"
        ;;
        
    2)
        print_section "Starting Docker Compose Installation..."
        
        # Check Docker
        print_section "Checking Docker installation..."
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed"
            echo "Please install Docker from https://docs.docker.com/get-docker/"
            exit 1
        fi
        DOCKER_VERSION=$(docker --version)
        print_success "$DOCKER_VERSION found"
        
        # Check Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose is not installed"
            echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
            exit 1
        fi
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "$COMPOSE_VERSION found"
        
        # Copy .env if not exists
        if [ ! -f .env ]; then
            print_section "Creating .env file..."
            cp .env.example .env
            print_success ".env file created"
        fi
        
        # Build and start services
        print_section "Building Docker images..."
        docker-compose build
        
        if [ $? -ne 0 ]; then
            print_error "Failed to build Docker images"
            exit 1
        fi
        print_success "Docker images built"
        
        print_section "Starting services..."
        docker-compose up -d
        
        if [ $? -ne 0 ]; then
            print_error "Failed to start Docker services"
            exit 1
        fi
        print_success "Docker services started"
        
        # Wait for services
        print_section "Waiting for services to be ready..."
        sleep 5
        
        # Check services
        echo ""
        docker-compose ps
        
        echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ Docker Installation Complete!${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
        
        echo "Services are running:"
        echo -e "  ${YELLOW}Backend${NC} - ${BLUE}http://localhost:3000${NC}"
        echo -e "  ${YELLOW}PostgreSQL${NC} - localhost:5432"
        echo ""
        echo "Useful Docker commands:"
        echo -e "  View logs: ${YELLOW}docker-compose logs -f backend${NC}"
        echo -e "  Run migrations: ${YELLOW}docker-compose exec backend npm run prisma:migrate${NC}"
        echo -e "  Seed database: ${YELLOW}docker-compose exec backend npm run prisma:seed${NC}"
        echo -e "  Stop services: ${YELLOW}docker-compose down${NC}"
        echo ""
        echo "Health check: ${BLUE}http://localhost:3000/api/health${NC}"
        echo ""
        echo "Test credentials (after seeding):"
        echo -e "  ${YELLOW}Marketer${NC}: marketer@example.com / Marketer123!"
        echo -e "  ${YELLOW}Manager${NC}: manager@example.com / Manager123!"
        echo -e "  ${YELLOW}Admin${NC}: admin@example.com / Admin123!"
        ;;
        
    3)
        echo "Exiting installer..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Documentation available in: README.md, QUICKSTART.md${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
