#!/bin/bash
# VESC CLI Installer - Works on macOS and Linux
# One-liner installation:
#   curl -sSL https://raw.githubusercontent.com/Can-0f-Tuna/VESC-CLI-/main/install.sh | bash

set -e

REPO_OWNER="Can-0f-Tuna"
REPO_NAME="VESC-CLI-"
INSTALL_DIR="$HOME/.local/bin"
BINARY_NAME="veac"

echo "🚀 VESC CLI Installer"
echo "===================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names
 case $ARCH in
    x86_64)
        ARCH="x86_64"
        ;;
    arm64|aarch64)
        ARCH="aarch64"
        ;;
    *)
        echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"
        echo "Supported: x86_64, aarch64 (ARM64)"
        exit 1
        ;;
esac

echo -e "${CYAN}📦 Detected: $OS $ARCH${NC}"
echo ""

# Check if we should build or download pre-built
DOWNLOAD_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/latest/download/veac-${OS}-${ARCH}"

echo -e "${CYAN}🔍 Checking for pre-built binary...${NC}"
if curl --output /dev/null --silent --head --fail "$DOWNLOAD_URL" 2>/dev/null; then
    echo -e "${GREEN}✅ Found pre-built binary${NC}"
    USE_PREBUILT=true
else
    echo -e "${YELLOW}⚠️  No pre-built binary found, will build from source${NC}"
    USE_PREBUILT=false
fi

# Create install directory
mkdir -p "$INSTALL_DIR"

if [ "$USE_PREBUILT" = true ]; then
    # Download pre-built binary
    echo -e "${CYAN}⬇️  Downloading VESC CLI...${NC}"
    curl -sSL "$DOWNLOAD_URL" -o "$INSTALL_DIR/$BINARY_NAME"
    chmod +x "$INSTALL_DIR/$BINARY_NAME"
    echo -e "${GREEN}✅ Downloaded to $INSTALL_DIR/$BINARY_NAME${NC}"
else
    # Build from source
    echo -e "${CYAN}🔧 Building from source...${NC}"
    
    # Check for Rust
    if ! command -v rustc &> /dev/null; then
        echo -e "${YELLOW}📦 Rust not found. Installing...${NC}"
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
        source "$HOME/.cargo/env"
    fi
    
    # Check for cargo
    if ! command -v cargo &> /dev/null; then
        echo -e "${RED}❌ Cargo not found. Please install Rust from https://rustup.rs/${NC}"
        exit 1
    fi
    
    # Clone and build
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    echo -e "${CYAN}📥 Cloning repository...${NC}"
    git clone "https://github.com/$REPO_OWNER/$REPO_NAME.git" .
    
    echo -e "${CYAN}🔨 Building...${NC}"
    cargo build --release
    
    # Install
    cp "target/release/$BINARY_NAME" "$INSTALL_DIR/"
    chmod +x "$INSTALL_DIR/$BINARY_NAME"
    
    # Cleanup
    cd -
    rm -rf "$TEMP_DIR"
    
    echo -e "${GREEN}✅ Built and installed to $INSTALL_DIR/$BINARY_NAME${NC}"
fi

# Create 'vesc' alias
ln -sf "$INSTALL_DIR/$BINARY_NAME" "$INSTALL_DIR/vesc"
echo -e "${GREEN}✅ Created 'vesc' alias${NC}"

# Check PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  $INSTALL_DIR is not in your PATH${NC}"
    
    # Detect shell
    SHELL_NAME=$(basename "$SHELL")
    case "$SHELL_NAME" in
        bash)
            CONFIG_FILE="$HOME/.bashrc"
            ;;
        zsh)
            CONFIG_FILE="$HOME/.zshrc"
            ;;
        fish)
            CONFIG_FILE="$HOME/.config/fish/config.fish"
            mkdir -p "$(dirname "$CONFIG_FILE")"
            ;;
        *)
            CONFIG_FILE="$HOME/.profile"
            ;;
    esac
    
    echo ""
    echo -e "${CYAN}Add this line to your $CONFIG_FILE:${NC}"
    echo "    export PATH=\"$INSTALL_DIR:\$PATH\""
    echo ""
    echo -e "${CYAN}Or run this command:${NC}"
    echo "    echo 'export PATH=\"$INSTALL_DIR:\$PATH\"' >> $CONFIG_FILE"
    echo ""
    echo -e "${CYAN}Then reload:${NC}"
    echo "    source $CONFIG_FILE"
    echo ""
fi

# Test
echo -e "${CYAN}🧪 Testing installation...${NC}"
if "$INSTALL_DIR/$BINARY_NAME" --version &>/dev/null; then
    VERSION=$("$INSTALL_DIR/$BINARY_NAME" --version)
    echo -e "${GREEN}✅ Version: $VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify version, but installation may still work${NC}"
fi

# Success message
echo ""
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo "======================"
echo ""
echo -e "${CYAN}Usage:${NC}"
echo "  vesc --help              Show help"
echo "  vesc device list-ports   List VESC devices"
echo "  vesc motor get-values    Get motor telemetry"
echo "  vesc motor stop          Stop motor"
echo ""
echo -e "${CYAN}Quick Start:${NC}"
echo "  1. Connect your VESC via USB"
echo "  2. Run: vesc device connect"
echo "  3. Run: vesc motor get-values"
echo ""
echo -e "${YELLOW}Note: Restart your terminal or run 'source ~/.bashrc' (or ~/.zshrc)${NC}"
echo ""
