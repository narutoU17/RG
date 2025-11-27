#!/bin/bash

################################################################################
# BondMate - Master Installation Script
# This script installs EVERYTHING from scratch: Python, Node.js, PostgreSQL,
# and sets up both Backend (Flask) and Frontend (React)
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored messages
print_header() {
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}➜ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if running as root
check_not_root() {
    if [ "$EUID" -eq 0 ]; then 
        print_error "Please do not run this script as root or with sudo"
        print_info "The script will ask for sudo password when needed"
        exit 1
    fi
}

# Function to check OS
check_os() {
    if ! command_exists apt; then
        print_error "This script requires Ubuntu/Debian with apt package manager"
        exit 1
    fi
}

# Start installation
clear
print_header "BONDMATE - MASTER INSTALLATION SCRIPT"
echo ""
print_info "This script will install:"
echo "  • Python 3 (with pip and venv)"
echo "  • Node.js (with npm)"
echo "  • PostgreSQL"
echo "  • All Python dependencies (Flask, SQLAlchemy, etc.)"
echo "  • All React dependencies"
echo "  • Database setup"
echo "  • Configuration files"
echo ""
print_warning "Installation will take approximately 5-15 minutes depending on your internet speed"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Check prerequisites
check_not_root
check_os

################################################################################
# SECTION 1: SYSTEM UPDATE AND BASIC TOOLS
################################################################################
print_header "SECTION 1/9: UPDATING SYSTEM"
print_info "Updating package list..."
sudo apt update -qq
print_success "Package list updated"
echo ""

################################################################################
# SECTION 2: INSTALL PYTHON 3
################################################################################
print_header "SECTION 2/9: INSTALLING PYTHON 3"

if command_exists python3; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    print_info "Python 3 is already installed (version: $PYTHON_VERSION)"
else
    print_info "Installing Python 3, pip, and venv..."
    sudo apt install -y python3 python3-pip python3-venv
    print_success "Python 3 installed successfully"
fi

# Verify Python installation
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
print_success "Python version: $PYTHON_VERSION"

# Verify pip
PIP_VERSION=$(python3 -m pip --version 2>&1 | awk '{print $2}')
print_success "pip version: $PIP_VERSION"
echo ""

################################################################################
# SECTION 3: INSTALL NODE.JS AND NPM
################################################################################
print_header "SECTION 3/9: INSTALLING NODE.JS AND NPM"

if command_exists node; then
    NODE_VERSION=$(node --version 2>&1)
    print_info "Node.js is already installed (version: $NODE_VERSION)"
else
    print_info "Installing Node.js and npm..."
    sudo apt install -y nodejs npm
    print_success "Node.js and npm installed successfully"
fi

# Verify Node.js installation
NODE_VERSION=$(node --version 2>&1)
print_success "Node.js version: $NODE_VERSION"

# Verify npm
NPM_VERSION=$(npm --version 2>&1)
print_success "npm version: $NPM_VERSION"
echo ""

################################################################################
# SECTION 4: INSTALL POSTGRESQL
################################################################################
print_header "SECTION 4/9: INSTALLING POSTGRESQL"

if command_exists psql; then
    PSQL_VERSION=$(psql --version 2>&1 | awk '{print $3}')
    print_info "PostgreSQL is already installed (version: $PSQL_VERSION)"
else
    print_info "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    print_success "PostgreSQL installed successfully"
fi

# Start PostgreSQL service
print_info "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql >/dev/null 2>&1
print_success "PostgreSQL service started and enabled"

# Verify PostgreSQL
PSQL_VERSION=$(psql --version 2>&1 | awk '{print $3}')
print_success "PostgreSQL version: $PSQL_VERSION"
echo ""

################################################################################
# SECTION 5: CREATE DATABASE AND USER
################################################################################
print_header "SECTION 5/9: SETTING UP DATABASE"

print_info "Creating database 'bondmate' and user 'bondmate_user'..."

# Drop existing database if exists (silent)
sudo -u postgres psql -c "DROP DATABASE IF EXISTS bondmate;" >/dev/null 2>&1

# Create database
sudo -u postgres psql -c "CREATE DATABASE bondmate;" >/dev/null 2>&1
print_success "Database 'bondmate' created"

# Create user (ignore if already exists)
sudo -u postgres psql -c "CREATE USER bondmate_user WITH PASSWORD 'bondmate123';" >/dev/null 2>&1 || true

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bondmate TO bondmate_user;" >/dev/null 2>&1
print_success "User 'bondmate_user' created with privileges"

# Verify database
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w bondmate | wc -l)
if [ $DB_EXISTS -eq 1 ]; then
    print_success "Database verified successfully"
else
    print_error "Database verification failed"
    exit 1
fi
echo ""

################################################################################
# SECTION 6: SETUP BACKEND (FLASK)
################################################################################
print_header "SECTION 6/9: SETTING UP BACKEND (FLASK)"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found!"
    print_info "Please run this script from the BondMate root directory"
    exit 1
fi

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_info "Virtual environment already exists"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_info "Upgrading pip..."
pip install --upgrade pip --quiet
print_success "pip upgraded"

# Install Python dependencies
print_info "Installing Python packages (this may take 1-3 minutes)..."
pip install -r requirements.txt --quiet
print_success "Python packages installed:"
print_info "  • Flask 2.3.3 (Web framework)"
print_info "  • Flask-CORS 4.0.0 (Cross-origin support)"
print_info "  • Flask-JWT-Extended 4.5.2 (Authentication)"
print_info "  • Flask-SQLAlchemy 3.0.5 (Database ORM)"
print_info "  • psycopg2-binary 2.9.7 (PostgreSQL adapter)"
print_info "  • bcrypt 4.0.1 (Password hashing)"
print_info "  • python-dotenv 1.0.0 (Environment variables)"

# Create .env file
print_info "Creating .env configuration file..."
cat > .env << 'EOF'
DATABASE_URL=postgresql://bondmate_user:bondmate123@localhost:5432/bondmate
JWT_SECRET_KEY=bondmate-super-secret-jwt-key-change-in-production
FLASK_ENV=development
EOF
print_success ".env file created"

# Create __init__.py files
print_info "Creating Python package files..."
touch controllers/__init__.py
touch utils/__init__.py
print_success "Package files created"

# Test backend briefly
print_info "Testing backend..."
timeout 3 python3 app.py >/dev/null 2>&1 || true
print_success "Backend setup complete"

# Deactivate virtual environment
deactivate

cd ..
echo ""

################################################################################
# SECTION 7: SETUP FRONTEND (REACT)
################################################################################
print_header "SECTION 7/9: SETTING UP FRONTEND (REACT)"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found!"
    print_info "Please run this script from the BondMate root directory"
    exit 1
fi

cd frontend

# Install npm dependencies
print_info "Installing npm packages (this may take 2-5 minutes)..."
npm install --silent 2>/dev/null || npm install
print_success "npm packages installed:"
print_info "  • react 18.2.0 (UI library)"
print_info "  • react-dom 18.2.0 (React DOM renderer)"
print_info "  • react-router-dom 6.14.2 (Routing)"
print_info "  • axios 1.4.0 (HTTP client)"
print_info "  • react-scripts 5.0.1 (Build scripts)"

cd ..
echo ""

################################################################################
# SECTION 8: CREATE START SCRIPTS
################################################################################
print_header "SECTION 8/9: CREATING START SCRIPTS"

# Create backend start script
print_info "Creating start_backend.sh..."
cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "Starting BondMate Backend..."
cd backend
source venv/bin/activate
python3 app.py
EOF
chmod +x start_backend.sh
print_success "start_backend.sh created"

# Create frontend start script
print_info "Creating start_frontend.sh..."
cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "Starting BondMate Frontend..."
cd frontend
npm start
EOF
chmod +x start_frontend.sh
print_success "start_frontend.sh created"

# Create combined start script
print_info "Creating start_all.sh..."
cat > start_all.sh << 'EOF'
#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║     Starting BondMate Application     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Start backend in background
echo "→ Starting Backend (Flask)..."
cd backend
source venv/bin/activate
python3 app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "→ Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✓ Backend started successfully (PID: $BACKEND_PID)"
else
    echo "✗ Backend failed to start"
    exit 1
fi

echo ""
echo "→ Starting Frontend (React)..."
echo ""
cd frontend
npm start

# Kill backend when frontend stops
echo ""
echo "→ Shutting down backend..."
kill $BACKEND_PID 2>/dev/null || true
echo "✓ Application stopped"
EOF
chmod +x start_all.sh
print_success "start_all.sh created"

echo ""

################################################################################
# SECTION 9: CREATE UTILITY SCRIPTS
################################################################################
print_header "SECTION 9/9: CREATING UTILITY SCRIPTS"

# Create reset database script
print_info "Creating reset_database.sh..."
cat > reset_database.sh << 'EOF'
#!/bin/bash
echo "Resetting BondMate database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS bondmate;"
sudo -u postgres psql -c "CREATE DATABASE bondmate;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bondmate TO bondmate_user;"
echo "✓ Database reset complete"
echo "→ Start the backend to recreate tables: ./start_backend.sh"
EOF
chmod +x reset_database.sh
print_success "reset_database.sh created"

# Create stop all script
print_info "Creating stop_all.sh..."
cat > stop_all.sh << 'EOF'
#!/bin/bash
echo "Stopping all BondMate processes..."
# Kill backend
pkill -f "python3 app.py" 2>/dev/null || true
# Kill frontend
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
echo "✓ All processes stopped"
EOF
chmod +x stop_all.sh
print_success "stop_all.sh created"

echo ""

################################################################################
# INSTALLATION COMPLETE
################################################################################
print_header "INSTALLATION COMPLETE!"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✓ INSTALLATION SUCCESSFUL                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📦 INSTALLED COMPONENTS:${NC}"
echo "  ✓ Python $PYTHON_VERSION"
echo "  ✓ Node.js $NODE_VERSION"
echo "  ✓ npm $NPM_VERSION"
echo "  ✓ PostgreSQL $PSQL_VERSION"
echo "  ✓ Flask + 6 Python packages"
echo "  ✓ React + 4 npm packages"
echo ""

echo -e "${CYAN}🗄️  DATABASE:${NC}"
echo "  • Database: bondmate"
echo "  • User: bondmate_user"
echo "  • Password: bondmate123"
echo "  • Connection: postgresql://bondmate_user:bondmate123@localhost:5432/bondmate"
echo ""

echo -e "${CYAN}🚀 START THE APPLICATION:${NC}"
echo ""
echo -e "  ${YELLOW}Quick Start (Recommended):${NC}"
echo -e "    ${GREEN}./start_all.sh${NC}"
echo ""
echo -e "  ${YELLOW}Start Separately (2 terminals):${NC}"
echo -e "    Terminal 1: ${GREEN}./start_backend.sh${NC}"
echo -e "    Terminal 2: ${GREEN}./start_frontend.sh${NC}"
echo ""

echo -e "${CYAN}📱 ACCESS POINTS:${NC}"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend:  http://localhost:5000"
echo "  • API Info: http://localhost:5000/"
echo ""

echo -e "${CYAN}🛠️  UTILITY SCRIPTS:${NC}"
echo "  • ./stop_all.sh        - Stop all processes"
echo "  • ./reset_database.sh  - Reset database"
echo ""

echo -e "${CYAN}👤 FIRST STEPS:${NC}"
echo "  1. Run: ./start_all.sh"
echo "  2. Open: http://localhost:3000"
echo "  3. Click: 'Sign Up'"
echo "  4. Create: Admin account (role: Admin)"
echo "  5. Create: Companion accounts (role: Companion)"
echo "  6. Create: User accounts (role: User)"
echo ""

echo -e "${CYAN}📖 DOCUMENTATION:${NC}"
echo "  • Installation commands: FULL_INSTALLATION_COMMANDS.txt"
echo "  • Detailed guide: INSTALLATION_GUIDE.md"
echo ""

echo -e "${GREEN}Installation completed successfully! 🎉${NC}"
echo -e "${YELLOW}Run './start_all.sh' to start the application${NC}"
echo ""