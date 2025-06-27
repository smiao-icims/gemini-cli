# Banner Customization

The Gemini CLI supports customizable banner displays that automatically adapt based on your authentication method and personal preferences.

## Overview

The CLI displays different banners depending on:
- **Authentication Type**: Ollama users see a special "🦙 OLLAMA EXTENSION" banner
- **Banner Style**: Choose between default enhanced banners or alternative llama-themed designs
- **Terminal Width**: Automatically adapts between long and short banner variants

## Banner Types

### 1. Default Gemini Banner
The standard Gemini CLI banner displayed for Google AI Studio and API key authentication.

### 2. Ollama Extension Banner
When using `GEMINI_AUTH_TYPE=ollama`, the CLI displays a special banner that clearly identifies this as the Ollama extension version:

```
🦙 OLLAMA EXTENSION v0.1.5 🦙
✨ Enhanced with Local AI Support ✨
```

### 3. Alternative Llama Banner
A completely different design with llama-themed ASCII art that can be enabled via the `/banner` command.

## Using the `/banner` Command

The `/banner` command allows you to customize your banner style:

### View Current Banner Style
```
/banner
```
Shows your current banner style and available options.

### Change Banner Style
```
/banner default    # Use enhanced Gemini banners (with Ollama branding when applicable)
/banner llama      # Use alternative llama-themed ASCII art
```

### Available Styles

- **`default`**: Enhanced Gemini logos with Ollama branding when using Ollama authentication
- **`llama`**: Alternative ASCII art with llama theme for a more playful appearance

## Configuration

Banner preferences are saved to your user settings and persist across sessions.

### Manual Configuration
You can also set the banner style in your `~/.config/gemini-cli/settings.json`:

```json
{
  "bannerStyle": "llama"
}
```

### Environment Variables
The banner automatically adapts based on your authentication:

```bash
# This will show the Ollama extension banner
export GEMINI_AUTH_TYPE=ollama
gemini

# This will show the standard Gemini banner  
export GEMINI_AUTH_TYPE=google
gemini
```

## Responsive Design

The CLI automatically chooses between long and short banner variants based on your terminal width:

- **Wide terminals (≥120 columns)**: Full banner with taglines
- **Narrow terminals (<120 columns)**: Compact banner version

## Examples

### Default Style with Ollama
```
 ███            █████████  ██████████ ██████   ██████ █████ ██████   █████ █████
░░░███         ███░░░░░███░░███░░░░░█░░██████ ██████ ░░███ ░░██████ ░░███ ░░███
  ░░░███      ███     ░░░  ░███  █ ░  ░███░█████░███  ░███  ░███░███ ░███  ░███
    ░░░███   ░███          ░██████    ░███░░███ ░███  ░███  ░███░░███░███  ░███
     ███░    ░███    █████ ░███░░█    ░███ ░░░  ░███  ░███  ░███ ░░██████  ░███
   ███░      ░░███  ░░███  ░███ ░   █ ░███      ░███  ░███  ░███  ░░█████  ░███
 ███░         ░░█████████  ██████████ █████     █████ █████ █████  ░░█████ █████
░░░            ░░░░░░░░░  ░░░░░░░░░░ ░░░░░     ░░░░░ ░░░░░ ░░░░░    ░░░░░ ░░░░░

                           🦙 OLLAMA EXTENSION v0.1.5 🦙
                      ✨ Enhanced with Local AI Support ✨
```

### Llama Style
```
  ██████╗ ███████╗███╗   ███╗██╗███╗   ██╗██╗    ██╗      ██╗      █████╗ ███╗   ███╗ █████╗ 
 ██╔════╝ ██╔════╝████╗ ████║██║████╗  ██║██║    ██║      ██║     ██╔══██╗████╗ ████║██╔══██╗
 ██║  ███╗█████╗  ██╔████╔██║██║██╔██╗ ██║██║    ██║      ██║     ███████║██╔████╔██║███████║
 ██║   ██║██╔══╝  ██║╚██╔╝██║██║██║╚██╗██║██║    ██║      ██║     ██╔══██║██║╚██╔╝██║██╔══██║
 ╚██████╔╝███████╗██║ ╚═╝ ██║██║██║ ╚████║██║    ███████╗ ███████╗██║  ██║██║ ╚═╝ ██║██║  ██║
  ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝    ╚══════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝
                                                                                              
                             🦙 OLLAMA EXTENSION v0.1.5 🦙                                   
                         ✨ Enhanced with Local AI Support ✨                               
```

## Benefits

### Clear Version Identification
- **Immediate Recognition**: Instantly know if you're using the official Gemini CLI or the Ollama extension
- **Version Display**: Shows the exact version (v0.1.5) of the Ollama extension
- **Feature Highlighting**: Clearly indicates enhanced local AI support

### Professional Distinction
- **No Confusion**: Prevents mixing up official and custom builds
- **Future-Proof**: When official versions are installed alongside, you'll always know which is which
- **Development Aid**: Helpful for developers working with multiple versions

## Troubleshooting

### Banner Not Updating
If your banner doesn't change after using `/banner`:
1. Restart the CLI to see the new banner
2. Check your settings with `/banner` to confirm the change was saved

### Wrong Banner Displayed
If you see the wrong banner type:
1. Check your authentication type: `echo $GEMINI_AUTH_TYPE`
2. Verify your banner style setting: `/banner`
3. Restart the CLI if needed

### Banner Too Wide/Narrow
The CLI automatically adapts to terminal width, but you can:
1. Resize your terminal window
2. Try the alternative banner style: `/banner llama`

---

This banner customization feature helps distinguish your Ollama-enhanced build from the official Gemini CLI while providing a personalized experience. 