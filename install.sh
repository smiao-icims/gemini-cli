#!/bin/bash

# Gemini CLI Installation Script for macOS
# This script builds and installs the Gemini CLI with Ollama integration

set -e

echo "🚀 Gemini CLI Installation Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check for existing official installation
check_existing_installation() {
    print_status "Checking for existing Gemini CLI installation..."
    
    if command -v gemini &> /dev/null; then
        CURRENT_VERSION=$(gemini --version 2>/dev/null || echo "unknown")
        GEMINI_PATH=$(which gemini)
        
        print_warning "Found existing Gemini CLI installation:"
        echo "  Path: $GEMINI_PATH"
        echo "  Version: $CURRENT_VERSION"
        
        # Check if it's the official installation
        if [[ "$GEMINI_PATH" == *"homebrew"* ]] || [[ "$GEMINI_PATH" == *"/usr/local/bin"* ]]; then
            print_warning "This appears to be the official Gemini CLI installation."
            echo "To use your custom build, the official version needs to be removed."
            echo
            read -p "Remove official installation and proceed? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                remove_official_installation
            else
                print_error "Installation cancelled. Cannot proceed with official version active."
                exit 1
            fi
        else
            print_status "Found custom installation, will override..."
        fi
    else
        print_success "No existing Gemini CLI found"
    fi
}

# Remove official installation
remove_official_installation() {
    print_status "Removing official Gemini CLI installation..."
    
    # Uninstall via npm
    npm uninstall -g @google/gemini-cli 2>/dev/null || true
    
    # Remove common symlink locations
    sudo rm -f /opt/homebrew/bin/gemini 2>/dev/null || true
    sudo rm -f /usr/local/bin/gemini 2>/dev/null || true
    
    # Verify removal
    if command -v gemini &> /dev/null; then
        print_warning "Some Gemini CLI installation still found at: $(which gemini)"
        print_warning "You may need to manually remove it"
    else
        print_success "Official Gemini CLI removed successfully"
    fi
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        echo "Please install Node.js 20.x from https://nodejs.org/"
        echo "Or use the installation guide in BUILD_AND_INSTALL.md"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version $NODE_VERSION is too old!"
        echo "Please install Node.js 18.x or higher"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        echo "Please install npm (usually comes with Node.js)"
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Build the project
build_project() {
    print_status "Building the project..."
    
    # Clean previous builds
    npm run clean
    
    # Build the project
    npm run build
    
    print_success "Project built successfully"
}

# Verify build
verify_build() {
    print_status "Verifying build..."
    
    if [ ! -f "bundle/gemini.js" ]; then
        print_error "Build failed! bundle/gemini.js not found"
        exit 1
    fi
    
    print_success "Build verification passed"
}

# Install globally
install_global() {
    print_status "Installing Gemini CLI globally..."
    
    # Use npm link for development installation
    npm link
    
    print_success "Gemini CLI installed globally"
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    if ! command -v gemini &> /dev/null; then
        print_error "Installation failed! 'gemini' command not found"
        echo "You may need to restart your terminal or check your PATH"
        exit 1
    fi
    
    VERSION=$(gemini --version 2>/dev/null || echo "unknown")
    GEMINI_PATH=$(which gemini)
    
    print_success "Gemini CLI installed successfully"
    echo "  Path: $GEMINI_PATH"
    echo "  Version: $VERSION"
    
    # Verify it's the custom build (version 0.1.5)
    if [[ "$VERSION" == "0.1.5" ]]; then
        print_success "✅ Custom build with Ollama integration is active!"
    else
        print_warning "Version $VERSION detected - expected 0.1.5"
        print_warning "Your custom build may not be active"
    fi
}

# Run tests (optional)
run_tests() {
    if [ "$1" = "--with-tests" ]; then
        print_status "Running tests..."
        npm run test
        print_success "All tests passed"
    fi
}

# Main installation process
main() {
    echo
    print_status "Starting installation process..."
    echo
    
    # Check for existing installation first
    check_existing_installation
    
    # Check prerequisites
    check_nodejs
    check_npm
    
    echo
    
    # Build and install
    install_dependencies
    build_project
    verify_build
    install_global
    verify_installation
    
    # Run tests if requested
    run_tests "$1"
    
    echo
    print_success "🎉 Installation completed successfully!"
    echo
    echo "You can now use the Gemini CLI by running:"
    echo "  gemini"
    echo
    echo "For Ollama integration, set these environment variables:"
    echo "  export GEMINI_AUTH_TYPE=ollama"
    echo "  export OLLAMA_BASE_URL=http://localhost:11434"
    echo
    echo "For more information, see BUILD_AND_INSTALL.md"
    echo
}

# Show usage if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Gemini CLI Installation Script"
    echo
    echo "Usage:"
    echo "  ./install.sh              Install Gemini CLI"
    echo "  ./install.sh --with-tests Install and run tests"
    echo "  ./install.sh --help       Show this help message"
    echo
    echo "This script will:"
    echo "  1. Check for existing Gemini CLI installations"
    echo "  2. Remove official installation if found (with confirmation)"
    echo "  3. Check Node.js and npm installation"
    echo "  4. Install dependencies"
    echo "  5. Build the project"
    echo "  6. Install globally using npm link"
    echo "  7. Verify the installation"
    echo
    exit 0
fi

# Run the main installation
main "$1" 