# Quick Install Guide

## 🚀 One-Command Installation

For the fastest installation experience:

```bash
# Make sure you have Node.js 20 installed
nvm use 20

# Run the automated installation script
./install.sh
```

## 📋 Manual Installation (3 Steps)

If you prefer manual control:

```bash
# 1. Install dependencies and build
npm ci && npm run build

# 2. Install globally
npm link

# 3. Test installation
gemini --version
```

## 🧪 Test Your Installation

### Basic Test
```bash
gemini --help
```

### Ollama Integration Test
```bash
# Set environment variables
export GEMINI_AUTH_TYPE=ollama
export OLLAMA_BASE_URL=http://localhost:11434

# Start Ollama (in another terminal)
ollama serve

# Test the CLI - you'll see the special Ollama banner!
gemini
> What is 2+2?

# Try the banner customization
> /banner llama    # Switch to alternative llama-themed banner
> /banner default  # Switch back to default style
```

## 🔧 Troubleshooting

### Command Not Found
```bash
# Check if it's in your PATH
which gemini

# If not found, try:
npm link
```

### Permission Issues
```bash
# Make executable
sudo chmod +x /usr/local/bin/gemini
```

### Node.js Version
```bash
# Check version
node --version

# Switch to Node 20 if using nvm
nvm use 20
```

## ✨ Features in This Build

- ✅ Ollama integration with thinking token filtering
- ✅ Improved performance and streaming
- ✅ Enhanced error handling
- ✅ Comprehensive unit test coverage
- ✅ Clean, readable output

## 📖 Full Documentation

For detailed instructions, see: `BUILD_AND_INSTALL.md`

---

That's it! You now have the latest Gemini CLI with Ollama support installed on your macOS system. 