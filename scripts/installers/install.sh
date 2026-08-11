#!/usr/bin/env bash
set -e

# Softority MCP Server Installer for macOS/Linux

INSTALL_DIR="$HOME/.code-with-softority"
BIN_DIR="$INSTALL_DIR/bin"
EXECUTABLE_NAME="code-with-softority"
# TODO: Replace with your actual GitHub repository release URL
DOWNLOAD_URL="https://github.com/prashantkumar342/code-with-softority/releases/latest/download/release.zip"

echo "========================================="
echo " Installing Softority MCP Server..."
echo "========================================="

# 1. Clean up old installation
if [ -d "$INSTALL_DIR" ]; then
    echo "-> Removing existing installation at $INSTALL_DIR..."
    rm -rf "$INSTALL_DIR"
fi

# 2. Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

# 3. Download and extract
echo "-> Downloading latest release from GitHub..."
TMP_ZIP=$(mktemp)
curl -L -o "$TMP_ZIP" "$DOWNLOAD_URL"

echo "-> Extracting to $INSTALL_DIR..."
unzip -q "$TMP_ZIP" -d "$INSTALL_DIR"
rm "$TMP_ZIP"

# 4. Install dependencies (Prisma & SQLite require native bindings for the specific OS)
echo "-> Installing dependencies and generating database client..."
cd "$INSTALL_DIR"
# Make sure they have Node.js installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed. Please install Node.js and try again."
    exit 1
fi
npm install --production --silent

echo "-> Initializing database..."
npx prisma db push

# 5. Create executable wrapper
echo "-> Setting up executable command '$EXECUTABLE_NAME'..."
cat > "$BIN_DIR/$EXECUTABLE_NAME" << 'EOF'
#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "$DIR/../build/server.js" "$@"
EOF
chmod +x "$BIN_DIR/$EXECUTABLE_NAME"

# 6. Add to PATH
SHELL_RC=""
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_RC="$HOME/.zshrc"
elif [[ "$SHELL" == *"bash"* ]]; then
    SHELL_RC="$HOME/.bashrc"
fi

if [ -n "$SHELL_RC" ]; then
    if ! grep -q "$BIN_DIR" "$SHELL_RC"; then
        echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$SHELL_RC"
        echo "-> Added $BIN_DIR to your PATH in $SHELL_RC"
        export PATH="$PATH:$BIN_DIR"
    fi
else
    echo "-> WARNING: Could not detect shell. Please add $BIN_DIR to your PATH manually."
fi

echo "========================================="
echo "✅ Installation Complete!"
echo ""
echo "To start using the MCP server, you can now run:"
echo "    $EXECUTABLE_NAME"
echo ""
echo "If the command is not found, restart your terminal or run:"
echo "    source $SHELL_RC"
echo "========================================="
