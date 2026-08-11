# 🚀 Release: Softority MCP Server v0.1.0

**Title:** Softority MCP Server v0.1.0 - Core Intelligence Engine 🚀
**Tag:** `v0.1.0`

Welcome to the first official release of the **code-with-softority** MCP server! 🎉 

This inaugural release establishes the foundational Model Context Protocol (MCP) server, granting your favorite AI assistants (like Claude Desktop, Windsurf, and Cursor) secure, structured access to your local development environment.

## 🌟 What's New in Phase 1

### 📁 File Management & Intelligence
- `file_list`: Navigate and list directory structures safely.
- `file_read`: Read file contents directly into the AI's context.
- `file_search`: Perform powerful searches across your codebase.
- **Resources**: Exposes interactive `project-tree` and `file-content` resources.

### 🌿 Git Tracking
- `git_status`: Instantly check current branches and uncommitted changes.
- `git_diff`: Extract detailed working-tree diffs to analyze ongoing work.

### 🏢 Project Context Management (Powered by Prisma & SQLite)
- `project_register` / `project_remove`: Safely manage multiple workspaces.
- `project_list`: Retrieve registered workspaces instantly.
- `project_analyze`: Deep inspection of project metadata.
- **Prompts**: Built-in AI prompts for `code_review` and `bug_analysis`.

## 📦 How to Install

We offer automated installers that download the `release.zip` attached below and set up your environment automatically.

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/prashantkumar342/code-with-softority/main/scripts/installers/install.ps1" -OutFile "$env:TEMP\install.ps1"; & "$env:TEMP\install.ps1"
```

**macOS / Linux (Bash):**
```bash
curl -fsSL "https://raw.githubusercontent.com/prashantkumar342/code-with-softority/main/scripts/installers/install.sh" | bash
```

## 🛠️ MCP Client Configuration

Once installed, add this to your MCP client configuration (e.g., `claude_desktop_config.json`):
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

> **Note for Manual Installation:** If you prefer not to use the installer script, you can download the `release.zip` from the assets below, extract it to a directory, run `npm install --production`, and point your MCP client to the bundled `./build/server.js` file using `node`.
