# Build and Install Gemini CLI on macOS

This guide provides step-by-step instructions to build and install this version of the Gemini CLI on your macOS system, including the Ollama integration and testing improvements.

## Prerequisites

### 1. System Requirements
- **macOS**: 10.15 (Catalina) or later
- **Node.js**: Version 20.x (recommended) or 18.x minimum
- **npm**: Comes with Node.js
- **Git**: For cloning the repository

### 2. Install Node.js 20 (Recommended)

If you don't have Node.js 20, install it using one of these methods:

#### Option A: Using Node Version Manager (nvm) - Recommended
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal or source your profile
source ~/.zshrc  # or ~/.bash_profile

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

#### Option B: Direct Download
Download from [nodejs.org](https://nodejs.org/) and install the LTS version (20.x).

### 3. Verify Installation
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x or higher
```

## Overriding Existing Official Installation

**If you already have the official Gemini CLI installed**, you need to remove it first to use your custom build:

### Check Current Installation
```bash
which gemini
gemini --version
```

### Remove Official Installation
```bash
# Uninstall via npm
npm uninstall -g @google/gemini-cli

# Remove any remaining symlinks (common locations)
sudo rm -f /opt/homebrew/bin/gemini
sudo rm -f /usr/local/bin/gemini

# Verify removal
which gemini  # Should show "not found"
```

## Build Instructions

### 1. Clone and Navigate to the Repository
```bash
# If you haven't already cloned the repository
git clone https://github.com/google-gemini/gemini-cli.git
cd gemini-cli

# Switch to the ollama-integration branch (if not already on it)
git checkout ollama-integration
```

### 2. Install Dependencies
```bash
# Install all dependencies for the monorepo
npm ci
```

### 3. Build the Project
```bash
# Clean any previous builds
npm run clean

# Build all packages and create the bundle
npm run build

# This will:
# - Build the core package
# - Build the CLI package  
# - Generate git commit info
# - Create the final bundle in ./bundle/
```

### 4. Verify the Build
```bash
# Check that the bundle was created
ls -la bundle/

# You should see:
# - gemini.js (the main executable)
# - Other bundled assets
```

## Installation Options

### Option 1: Global Installation via npm link (Recommended for Development)

This creates a symlink to your built version, so updates to your code will be reflected immediately.

```bash
# Link the package globally
npm link

# Verify installation
which gemini
# Should show: /Users/[username]/.nvm/versions/node/v20.x.x/bin/gemini (or similar)

# Test the installation
gemini --version
# Should show: 0.1.5
```

### Option 2: Manual Installation

```bash
# Create a directory for the CLI
sudo mkdir -p /usr/local/lib/gemini-cli

# Copy the bundle
sudo cp -r bundle/* /usr/local/lib/gemini-cli/

# Create a symlink to make it globally accessible
sudo ln -sf /usr/local/lib/gemini-cli/gemini.js /usr/local/bin/gemini

# Make it executable
sudo chmod +x /usr/local/bin/gemini

# Verify installation
gemini --version
```

### Option 3: Local Installation (User Directory)

```bash
# Create a local bin directory if it doesn't exist
mkdir -p ~/bin

# Copy the bundle
cp -r bundle/* ~/bin/

# Add to your PATH (add this to ~/.zshrc or ~/.bash_profile)
export PATH="$HOME/bin:$PATH"

# Reload your shell configuration
source ~/.zshrc  # or ~/.bash_profile

# Make it executable
chmod +x ~/bin/gemini.js

# Create an alias or symlink
ln -sf ~/bin/gemini.js ~/bin/gemini

# Verify installation
gemini --version
```

## Verification and Testing

### 1. Basic Functionality Test
```bash
# Test that the CLI starts
gemini --help

# Test version information
gemini --version
```

### 2. Test Ollama Integration (if you have Ollama installed)
```bash
# If you have Ollama installed, you can test the integration
# Set up Ollama authentication
export GEMINI_AUTH_TYPE=ollama
export OLLAMA_BASE_URL=http://localhost:11434  # Default Ollama URL

# Test with a simple query
gemini
# Then in the CLI: "What is 2+2?"
```

### 3. Run the Test Suite (Optional)
```bash
# Run all tests to verify everything works
npm run test

# Run with coverage
npm run test:coverage

# Verify coverage meets requirements
npm run verify:coverage
```

## Configuration

### 1. Authentication Setup

#### For Google AI Studio (Default)
```bash
# No additional setup needed - the CLI will prompt for authentication
gemini
# Follow the authentication prompts
```

#### For API Key Authentication
```bash
# Set your API key
export GEMINI_API_KEY="your-api-key-here"
gemini
```

#### For Ollama Integration
```bash
# Set Ollama as the auth type
export GEMINI_AUTH_TYPE=ollama
export OLLAMA_BASE_URL=http://localhost:11434

# Make sure Ollama is running
ollama serve  # In another terminal

gemini
```

### 2. Configuration File
The CLI will create a config file at:
- `~/.config/gemini-cli/config.json`

You can edit this file to set default preferences.

## Updating Your Installation

### For npm link Installation
```bash
cd /path/to/gemini-cli
git pull origin ollama-integration
npm run clean
npm run build
# The linked version will automatically use the new build
```

### For Manual Installation
```bash
cd /path/to/gemini-cli
git pull origin ollama-integration
npm run clean
npm run build

# Re-copy the bundle
sudo cp -r bundle/* /usr/local/lib/gemini-cli/
```

## Uninstallation

### For npm link Installation
```bash
npm unlink -g @google/gemini-cli
```

### For Manual Installation
```bash
sudo rm -rf /usr/local/lib/gemini-cli
sudo rm /usr/local/bin/gemini
```

### For Local Installation
```bash
rm -rf ~/bin/gemini*
# Remove the PATH export from your shell configuration
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied
```bash
# If you get permission errors, make sure the file is executable
chmod +x /usr/local/bin/gemini
# or
chmod +x ~/bin/gemini
```

#### 2. Command Not Found
```bash
# Make sure the installation directory is in your PATH
echo $PATH

# For manual installation, add to ~/.zshrc:
export PATH="/usr/local/bin:$PATH"

# For local installation, add to ~/.zshrc:
export PATH="$HOME/bin:$PATH"
```

#### 3. Official Version Still Active
```bash
# Check which version is being used
which gemini
gemini --version

# If it shows the old version, remove the official installation:
npm uninstall -g @google/gemini-cli
sudo rm -f /opt/homebrew/bin/gemini
sudo rm -f /usr/local/bin/gemini

# Then re-link your custom build
npm link
```

#### 4. Node.js Version Issues
```bash
# Check your Node.js version
node --version

# If using nvm, switch to Node 20
nvm use 20
```

#### 5. Build Failures
```bash
# Clean and reinstall dependencies
npm run clean
rm -rf node_modules package-lock.json
npm ci
npm run build
```

### Getting Help

If you encounter issues:

1. **Check the logs**: The CLI creates logs in `~/.config/gemini-cli/logs/`
2. **Verify dependencies**: Run `npm run test` to ensure everything is working
3. **Check the documentation**: See the [troubleshooting guide](./docs/troubleshooting.md)
4. **File an issue**: Create an issue on the GitHub repository

## Features in This Version

This build includes:

- ✅ **Ollama Integration**: Support for local Ollama models
- ✅ **Improved Performance**: Optimized streaming and response handling
- ✅ **Enhanced Testing**: Comprehensive unit test coverage
- ✅ **Better Error Handling**: Improved error messages and recovery
- ✅ **Thinking Token Filtering**: Clean output without thinking tokens
- ✅ **Custom Banner**: Distinctive "🦙 OLLAMA EXTENSION v0.1.5 🦙" banner when using Ollama
- ✅ **Banner Customization**: Switch between banner styles using `/banner` command

## Development Commands

If you're working on the codebase:

```bash
# Start in development mode
npm start

# Run tests
npm run test

# Check code coverage
npm run test:coverage
npm run verify:coverage

# Lint and format code
npm run lint
npm run format

# Full preflight check
npm run preflight
```

---

You now have a fully functional Gemini CLI installation with all the latest improvements and Ollama integration! 