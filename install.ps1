# VESC CLI Installer for Windows
# One-liner: irm https://raw.githubusercontent.com/Can-0f-Tuna/VESC-CLI-/main/install.ps1 | iex

param(
    [switch]$DevMode = $false
)

$ErrorActionPreference = "Stop"

$REPO_OWNER = "Can-0f-Tuna"
$REPO_NAME = "VESC-CLI-"
$INSTALL_DIR = "$env:USERPROFILE\.vesc-cli\bin"
$BINARY_NAME = "veac.exe"
$VESC_ALIAS = "vesc.exe"

Write-Host "🚀 VESC CLI Installer for Windows" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Detect architecture
$ARCH = $env:PROCESSOR_ARCHITECTURE
if ($ARCH -eq "AMD64") {
    $ARCH = "x86_64"
} elseif ($ARCH -eq "ARM64") {
    $ARCH = "aarch64"
} else {
    Write-Host "❌ Unsupported architecture: $ARCH" -ForegroundColor Red
    Write-Host "Supported: x86_64, ARM64" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Detected: Windows $ARCH" -ForegroundColor Cyan
Write-Host ""

# Create install directory
New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null

# Check for pre-built binary
$DOWNLOAD_URL = "https://github.com/$REPO_OWNER/$REPO_NAME/releases/latest/download/veac-windows-$ARCH.exe"

Write-Host "🔍 Checking for pre-built binary..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $DOWNLOAD_URL -Method Head -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Found pre-built binary" -ForegroundColor Green
    $USE_PREBUILT = $true
} catch {
    Write-Host "⚠️  No pre-built binary found, will build from source" -ForegroundColor Yellow
    $USE_PREBUILT = $false
}

if ($USE_PREBUILT -and -not $DevMode) {
    # Download pre-built binary
    Write-Host ""
    Write-Host "⬇️  Downloading VESC CLI..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile "$INSTALL_DIR\$BINARY_NAME" -UseBasicParsing
    Write-Host "✅ Downloaded to $INSTALL_DIR\$BINARY_NAME" -ForegroundColor Green
} else {
    # Build from source
    Write-Host ""
    Write-Host "🔧 Building from source..." -ForegroundColor Cyan
    
    # Check for Rust
    $RustInstalled = $false
    try {
        $RustVersion = rustc --version 2>$null
        if ($RustVersion) {
            Write-Host "✅ Rust found: $RustVersion" -ForegroundColor Green
            $RustInstalled = $true
        }
    } catch {
        $RustInstalled = $false
    }
    
    if (-not $RustInstalled) {
        Write-Host "📦 Rust not found. Installing..." -ForegroundColor Yellow
        Write-Host "   Downloading rustup-init..." -ForegroundColor Gray
        
        $RustupUrl = "https://win.rustup.rs/x86_64"
        $RustupPath = "$env:TEMP\rustup-init.exe"
        
        Invoke-WebRequest -Uri $RustupUrl -OutFile $RustupPath -UseBasicParsing
        
        Write-Host "   Running installer..." -ForegroundColor Gray
        & $RustupPath -y --default-toolchain stable
        
        $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
        
        # Verify
        try {
            $RustVersion = rustc --version 2>$null
            if ($RustVersion) {
                Write-Host "✅ Rust installed: $RustVersion" -ForegroundColor Green
            } else {
                throw "Installation failed"
            }
        } catch {
            Write-Host "❌ Rust installation failed. Please install from https://rustup.rs/" -ForegroundColor Red
            exit 1
        }
    }
    
    # Clone and build
    $TEMP_DIR = Join-Path $env:TEMP "vesc-cli-build-$(Get-Random)"
    New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null
    
    try {
        Set-Location $TEMP_DIR
        
        Write-Host "📥 Cloning repository..." -ForegroundColor Cyan
        git clone "https://github.com/$REPO_OWNER/$REPO_NAME.git" .
        
        Write-Host "🔨 Building..." -ForegroundColor Cyan
        cargo build --release 2>&1 | ForEach-Object {
            if ($_ -match "Compiling|Finished|Running") {
                Write-Host "   $_" -ForegroundColor Gray
            }
        }
        
        # Copy binary
        Copy-Item -Path "target\release\$BINARY_NAME" -Destination "$INSTALL_DIR\$BINARY_NAME" -Force
        Write-Host "✅ Built and installed to $INSTALL_DIR\$BINARY_NAME" -ForegroundColor Green
    } finally {
        # Cleanup
        Set-Location $env:USERPROFILE
        if (Test-Path $TEMP_DIR) {
            Remove-Item -Recurse -Force $TEMP_DIR
        }
    }
}

# Create vesc alias
Copy-Item -Path "$INSTALL_DIR\$BINARY_NAME" -Destination "$INSTALL_DIR\$VESC_ALIAS" -Force
Write-Host "✅ Created 'vesc' alias" -ForegroundColor Green

# Create vesc.cmd for CMD support
$VescCmd = @"
@echo off
"$INSTALL_DIR\$BINARY_NAME" %*
"@
$VescCmd | Out-File -FilePath "$INSTALL_DIR\vesc.cmd" -Encoding ASCII

# Add to PATH
Write-Host ""
Write-Host "🔧 Adding to PATH..." -ForegroundColor Cyan

$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$INSTALL_DIR*") {
    Write-Host "   Adding $INSTALL_DIR to user PATH" -ForegroundColor Gray
    $NewPath = "$UserPath;$INSTALL_DIR"
    [Environment]::SetEnvironmentVariable("Path", $NewPath, "User")
    Write-Host "✅ PATH updated!" -ForegroundColor Green
} else {
    Write-Host "✅ Already in PATH" -ForegroundColor Green
}

# Update current session
$env:PATH = "$INSTALL_DIR;$env:PATH"

# Test
Write-Host ""
Write-Host "🧪 Testing installation..." -ForegroundColor Cyan
try {
    $Version = & "$INSTALL_DIR\$BINARY_NAME" --version 2>&1
    Write-Host "   Version: $Version" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Could not verify version" -ForegroundColor Yellow
}

# Success message
Write-Host ""
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  vesc --help              Show help" -ForegroundColor White
Write-Host "  vesc device list-ports   List VESC devices" -ForegroundColor White
Write-Host "  vesc motor get-values    Get motor telemetry" -ForegroundColor White
Write-Host "  vesc motor stop          Stop motor" -ForegroundColor White
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Cyan
Write-Host "  1. Connect VESC via USB" -ForegroundColor White
Write-Host "  2. Run: vesc device connect" -ForegroundColor White
Write-Host "  3. Run: vesc motor get-values" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: Restart your terminal or run 'refreshenv' for PATH changes to take effect." -ForegroundColor Yellow
Write-Host ""

# Quick test
Write-Host "Testing 'vesc' command..." -ForegroundColor Cyan
try {
    $Test = & "$INSTALL_DIR\$BINARY_NAME" --help 2>&1 | Select-Object -First 3
    $Test | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    Write-Host ""
    Write-Host "✅ VESC command is ready!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Quick test failed, but should work after PATH refresh" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Happy VESC controlling! 🚀" -ForegroundColor Cyan
