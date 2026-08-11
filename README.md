# Softority MCP Server

A modular, high-performance [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server providing AI clients (like Claude Desktop, Cursor, and Windsurf) with safe, structured access to your local filesystem, Git repositories, and project contexts.

---

## 🚀 Features

- **File Operations (`file`)**: Read files, list directory contents, search codebase (`ripgrep` style), and inspect project tree representations.
- **Git Integration (`git`)**: Inspect real-time `git status` and `git diff` working tree changes.
- **Project Management (`project`)**: Register local projects, track project metadata using a local SQLite database, and run automated AI analysis prompts.
- **Built-in AI Prompts**: Prompts for automated `code_review` and `bug_analysis`.

---

## 📦 Installation Options

Choose the installation method that best suits your needs:

### Option 1: Automatic One-Line Installer (Recommended for Users)

Automated scripts download the latest pre-built release, set up dependencies, create a binary wrapper, and configure your system `PATH`.

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/prashantkumar342/code-with-softority/main/scripts/installers/install.ps1" -OutFile "$env:TEMP\install.ps1"; & "$env:TEMP\install.ps1"
```

**macOS / Linux (Bash):**
```bash
curl -fsSL "https://raw.githubusercontent.com/prashantkumar342/code-with-softority/main/scripts/installers/install.sh" | bash
```

*After installation, the global command `code-with-softority` will be available in your terminal!*

---

### Option 2: Pre-built Release Package (No Compilation Required)

If you prefer not to use installer scripts, you can download the standalone pre-built directory from GitHub Releases:

1. Go to **Releases** on GitHub and download `release.zip`.
2. Extract `release.zip` to your preferred directory (e.g., `~/.code-with-softority`).
3. Open a terminal in the extracted folder and run:
   ```bash
   npm install --production
   ```
4. Point your MCP client to the bundled executable at `./build/server.js`.

---

### Option 3: Build from Source (For Developers & Contributors)

If you want to modify or contribute to the source code:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prashantkumar342/code-with-softority.git
   cd mcp-server
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Build the server:**
   ```bash
   npm run build
   ```
   *This compiles the server into a single-file executable at `build/server.js`.*

---

## ⚙️ MCP Client Configuration

### Claude Desktop Setup
Edit your `claude_desktop_config.json`:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Add the server configuration:
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
*(If installed manually or built from source, replace `"command": "code-with-softority"` with `"command": "node"` and `"args": ["/absolute/path/to/build/server.js"]`)*

---

## 📂 Directory Structure

```text
mcp/
├── build/                 # Pre-compiled bundled executable (build/server.js)
├── scripts/               # Installer scripts for Windows & Unix
│   └── installers/        # install.ps1, install.sh, and setup guides
├── prisma/                # Prisma schema & SQLite database migrations
├── tests/                 # Vitest unit and integration test suite
└── src/                   # Source code
    ├── server.ts          # MCP Server entry point
    ├── core/              # Registries (Tools, Resources, Prompts, Database)
    └── modules/           # Feature domain modules
        ├── file/          # File tools & resources
        ├── git/           # Git status & diff tools
        └── project/       # Project registration & prompt analysis
```

---

## 🧪 Testing & Verification

Run the full Vitest suite:
```bash
npm run test
```

---

## 📄 License

This project is licensed under a custom **Source-Available & Collaboration License**. See [LICENSE](LICENSE) for full details.
