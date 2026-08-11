# Softority MCP Server Setup Guide

Once you have installed the Softority MCP Server via the installation script, it is available globally on your machine using the `code-with-softority` command.

You can now connect this server to **Claude Desktop**, **Windsurf**, or any other MCP-compatible IDE.

---

## 1. Using Claude Desktop

To add the Softority MCP Server to Claude Desktop, you need to edit your `claude_desktop_config.json` file.

### Configuration File Locations:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### What to Add:
Open the configuration file and add the following entry under the `mcpServers` object:

```json
{
  "mcpServers": {
    "softority": {
      "command": "code-with-softority",
      "args": []
    }
  }
}
```

> **Note**: If `code-with-softority` is not found, you may need to restart Claude Desktop or your computer so it picks up the updated system `PATH`.
> If it still cannot find the command, use the absolute path:
> - **macOS/Linux**: `~/.code-with-softority/bin/code-with-softority` (replace `~` with `/Users/yourusername`)
> - **Windows**: `C:\Users\YourUsername\AppData\Local\.code-with-softority\bin\code-with-softority.cmd`

---

## 2. Using an IDE (e.g., Windsurf, Cursor)

If your IDE natively supports the Model Context Protocol (MCP), the configuration is identical. Just provide the executable command:

- **Command**: `code-with-softority`

If your IDE requires you to configure it via a JSON settings file, it will look exactly the same as the Claude Desktop configuration:

```json
{
  "mcpServers": {
    "softority": {
      "command": "code-with-softority",
      "args": []
    }
  }
}
```

## How to Install (For Your Users)

Users can install the latest release by running these single commands in their terminals:

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/prashantkumar342/code-with-softority/main/scripts/installers/install.ps1" -OutFile "$env:TEMP\install.ps1"; & "$env:TEMP\install.ps1"
```

**macOS / Linux (Bash):**
```bash
curl -fsSL "https://raw.githubusercontent.com/prashantkumar342/code-with-softority/main/scripts/installers/install.sh" | bash
```

*(Be sure to replace the URLs with the actual raw URLs of your install scripts once they are pushed to GitHub!)*
