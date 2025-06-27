# Gemini CLI - Ollama Extension

[![Gemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)

![Gemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

## 🦙 Ollama Extension Overview

This is an **enhanced version** of the official Gemini CLI with **Ollama integration**, allowing you to run powerful language models locally on your machine. This extension provides all the capabilities of the original Gemini CLI while adding support for local AI inference through Ollama.

### Key Features of the Ollama Extension:

- 🔐 **Privacy-First**: Run AI models completely offline on your local machine
- ⚡ **Performance**: Direct local inference without network latency
- 🎯 **Model Flexibility**: Support for Llama, Mistral, Qwen, Gemma, and many other models
- 🛠️ **Full Compatibility**: All original Gemini CLI features and tools work seamlessly
- 🎨 **Custom Branding**: Distinctive Ollama-themed banners and interface
- 🔄 **Easy Switching**: Switch between Ollama and Gemini models as needed

This repository contains the Gemini CLI, a command-line AI workflow tool that connects to your
tools, understands your code and accelerates your workflows.

With the Gemini CLI you can:

- Query and edit large codebases in and beyond Gemini's 1M token context window.
- Generate new apps from PDFs or sketches, using Gemini's multimodal capabilities.
- Automate operational tasks, like querying pull requests or handling complex rebases.
- Use tools and MCP servers to connect new capabilities, including [media generation with Imagen,
  Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Ground your queries with the [Google Search](https://ai.google.dev/gemini-api/docs/grounding)
  tool, built in to Gemini.

## Quickstart

1. **Prerequisites:** Ensure you have [Node.js version 18](https://nodejs.org/en/download) or higher installed.
2. **Run the CLI:** Execute the following command in your terminal:

   ```bash
   npx https://github.com/google-gemini/gemini-cli
   ```

   Or install it with:

   ```bash
   npm install -g @google/gemini-cli
   gemini
   ```

3. **Pick a color theme**
4. **Authenticate:** When prompted, sign in with your personal Google account. This will grant you up to 60 model requests per minute and 1,000 model requests per day using Gemini.

You are now ready to use the Gemini CLI!

### For advanced use or increased limits:

If you need to use a specific model or require a higher request capacity, you can use an API key:

1. Generate a key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Set it as an environment variable in your terminal. Replace `YOUR_API_KEY` with your generated key.

   ```bash
   export GEMINI_API_KEY="YOUR_API_KEY"
   ```

For other authentication methods, including Google Workspace accounts, see the [authentication](./docs/cli/authentication.md) guide.

## 🦙 Ollama Setup and Usage

### Prerequisites for Ollama

1. **Install Ollama**: Download and install Ollama from [ollama.ai](https://ollama.ai)
2. **Pull a Model**: Download a language model (e.g., `ollama pull qwen2.5:7b` or `ollama pull llama3.1:8b`)
3. **Start Ollama Server**: Run `ollama serve` to start the local server

### Using the Ollama Extension

1. **Install this Extension**:
   ```bash
   git clone <this-repository>
   cd gemini-cli
   npm install
   npm run build
   npm link
   ```

2. **Configure for Ollama**:
   ```bash
   export GEMINI_AUTH_TYPE=ollama
   export OLLAMA_MODEL=qwen2.5:7b  # or your preferred model
   export OLLAMA_BASE_URL=http://localhost:11434  # default Ollama URL
   ```

3. **Start the CLI**:
   ```bash
   gemini
   ```

You'll see the distinctive Ollama extension banner and can start using local AI models immediately!

### Ollama-Specific Features

- **Custom Banners**: The CLI automatically displays Ollama-themed ASCII art when using Ollama
- **Banner Customization**: Use `/banner ollama` to switch between different banner styles
- **Local Privacy**: All processing happens on your machine - no data sent to external servers
- **Model Management**: Switch models by changing the `OLLAMA_MODEL` environment variable

### Switching Between Ollama and Gemini

You can easily switch between local Ollama models and Google's Gemini:

```bash
# Use Ollama (local)
export GEMINI_AUTH_TYPE=ollama
gemini

# Use Gemini (cloud)
unset GEMINI_AUTH_TYPE  # or set to 'oauth' or 'api_key'
gemini
```

## Examples

Once the CLI is running, you can start interacting with Gemini from your shell.

You can start a project from a new directory:

```sh
cd new-project/
gemini
> Write me a Gemini Discord bot that answers questions using a FAQ.md file I will provide
```

Or work with an existing project:

```sh
git clone https://github.com/google-gemini/gemini-cli
cd gemini-cli
gemini
> Give me a summary of all of the changes that went in yesterday
```

### Next steps

- **For Ollama users**: See [BUILD_AND_INSTALL.md](./BUILD_AND_INSTALL.md) for detailed installation instructions
- **Quick setup**: Use the automated [install.sh](./install.sh) script for one-command installation
- Learn how to [contribute to or build from the source](./CONTRIBUTING.md).
- Explore the available **[CLI Commands](./docs/cli/commands.md)**.
- Check out **[Banner Customization](./docs/cli/banner-customization.md)** for Ollama-specific UI options
- If you encounter any issues, review the **[Troubleshooting guide](./docs/troubleshooting.md)**.
- For more comprehensive documentation, see the [full documentation](./docs/index.md).
- Take a look at some [popular tasks](#popular-tasks) for more inspiration.

### Troubleshooting

Head over to the [troubleshooting](docs/troubleshooting.md) guide if you're
having issues.

## 🔄 Ollama vs Gemini: When to Use Each

### Use Ollama Extension When:
- 🔐 **Privacy is critical**: Sensitive code or data that shouldn't leave your machine
- 🌐 **Offline work**: No internet connection or unreliable connectivity
- ⚡ **Low latency needed**: Real-time applications requiring instant responses
- 💰 **Cost optimization**: Avoid API usage costs for high-volume tasks
- 🎯 **Specific models**: Need access to particular open-source models

### Use Gemini (Cloud) When:
- 🧠 **Maximum capability**: Need the most advanced reasoning and multimodal features
- 📊 **Large context**: Working with very large codebases (1M+ tokens)
- 🔍 **Web grounding**: Need real-time web search integration
- 🚀 **Latest features**: Want access to cutting-edge Gemini capabilities

### Version Information
- **Extension Version**: v0.1.5
- **Base Gemini CLI**: Compatible with latest official release
- **Unique Features**: Ollama integration, custom banners, local AI support

## Popular tasks

### Explore a new codebase

Start by `cd`ing into an existing or newly-cloned repository and running `gemini`.

```text
> Describe the main pieces of this system's architecture.
```

```text
> What security mechanisms are in place?
```

### Work with your existing code

```text
> Implement a first draft for GitHub issue #123.
```

```text
> Help me migrate this codebase to the latest version of Java. Start with a plan.
```

### Automate your workflows

Use MCP servers to integrate your local system tools with your enterprise collaboration suite.

```text
> Make me a slide deck showing the git history from the last 7 days, grouped by feature and team member.
```

```text
> Make a full-screen web app for a wall display to show our most interacted-with GitHub issues.
```

### Interact with your system

```text
> Convert all the images in this directory to png, and rename them to use dates from the exif data.
```

```text
> Organise my PDF invoices by month of expenditure.
```

## Terms of Service and Privacy Notice

For details on the terms of service and privacy notice applicable to your use of Gemini CLI, see the [Terms of Service and Privacy Notice](./docs/tos-privacy.md).
