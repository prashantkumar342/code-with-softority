<#
.SYNOPSIS
Softority MCP Server Installer for Windows

.DESCRIPTION
Downloads the latest release of the Softority MCP Server, sets up the directory,
installs dependencies, and adds it to the user's PATH so it can be run from anywhere.
#>

$ErrorActionPreference = 'Stop'

$EXECUTABLE_NAME = "code-with-softority"
$INSTALL_DIR = Join-Path $env:LOCALAPPDATA ".code-with-softority"
$BIN_DIR = Join-Path $INSTALL_DIR "bin"
# TODO: Replace with your actual GitHub repository release URL
$DOWNLOAD_URL = "https://github.com/prashantkumar342/code-with-softority/releases/latest/download/release.zip"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Installing Softority MCP Server..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Clean up old installation
if (Test-Path $INSTALL_DIR) {
    Write-Host "-> Removing existing installation at $INSTALL_DIR..."
    Remove-Item -Path $INSTALL_DIR -Recurse -Force
}

# 2. Create directories
Write-Host "-> Creating installation directories..."
New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $BIN_DIR -Force | Out-Null

# 3. Download and extract
Write-Host "-> Downloading latest release from GitHub..."
$TMP_ZIP = Join-Path $env:TEMP "softority-release.zip"
Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $TMP_ZIP

Write-Host "-> Extracting to $INSTALL_DIR..."
Expand-Archive -Path $TMP_ZIP -DestinationPath $INSTALL_DIR -Force
Remove-Item -Path $TMP_ZIP -Force

# 4. Install dependencies (Prisma & SQLite require native bindings for the specific OS)
Write-Host "-> Installing dependencies and generating database client..."
Push-Location $INSTALL_DIR

if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm is not installed. Please install Node.js and try again." -ForegroundColor Red
    Pop-Location
    exit 1
}

# Run npm install
npm install --production --silent

Write-Host "-> Initializing database..."
npx.cmd prisma db push

Pop-Location

# 5. Create executable wrapper
Write-Host "-> Setting up executable command '$EXECUTABLE_NAME'..."
$CMD_SCRIPT = Join-Path $BIN_DIR "$EXECUTABLE_NAME.cmd"
$CMD_CONTENT = @"
@echo off
setlocal
set DIR=%~dp0
node "%DIR%\..\build\server.js" %*
"@
Set-Content -Path $CMD_SCRIPT -Value $CMD_CONTENT

# 6. Add to PATH
Write-Host "-> Checking User PATH..."
$USER_PATH = [Environment]::GetEnvironmentVariable("Path", "User")
if ($USER_PATH -notlike "*$BIN_DIR*") {
    Write-Host "-> Adding $BIN_DIR to your User PATH..."
    $NEW_PATH = "$USER_PATH;$BIN_DIR"
    [Environment]::SetEnvironmentVariable("Path", $NEW_PATH, "User")
    # Also set it in the current process so it works immediately
    $env:Path = "$env:Path;$BIN_DIR"
}
else {
    Write-Host "-> $BIN_DIR is already in your PATH."
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start using the MCP server, you can now run:"
Write-Host "    $EXECUTABLE_NAME" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: You may need to restart your terminal or IDE for the PATH changes to fully take effect."
Write-Host "=========================================" -ForegroundColor Green
