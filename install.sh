#!/bin/bash
# VESC CLI (veac) Installer + Skill Setup
# One-liner: curl -sSL https://raw.githubusercontent.com/Can-0f-Tuna/veac/main/install.sh | bash
#
# Options:
#   --cli-only    Install only the CLI tool
#   --skill-only  Install only the skill
#   --dev         Clone for development (full repo)

set -e

REPO_OWNER="Can-0f-Tuna"
REPO_NAME="veac"
INSTALL_DIR="$HOME/.local/bin"
BINARY_NAME="veac"
TEMP_DIR=$(mktemp -d)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
CLI_ONLY=false
SKILL_ONLY=false
DEV_MODE=false

for arg in "$@"; do
    case $arg in
        --cli-only)
            CLI_ONLY=true
            shift
            ;;
        --skill-only)
            SKILL_ONLY=true
            shift
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
    esac
done

echo "🚀 VESC CLI Installer"
echo "===================="
echo ""

# Function to cleanup
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

# Detect OS and architecture
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    
    case $ARCH in
        x86_64)
            ARCH="x64"
            ;;
        arm64|aarch64)
            ARCH="arm64"
            ;;
        *)
            echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"
            echo "Supported: x86_64 (x64), arm64 (aarch64)"
            exit 1
            ;;
    esac
    
    echo -e "${CYAN}📦 Detected: $OS ($ARCH)${NC}"
}

# Check for required tools
check_dependencies() {
    echo ""
    echo -e "${CYAN}🔍 Checking dependencies...${NC}"
    
    # Check for git
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is required but not installed${NC}"
        echo "Please install Git: https://git-scm.com/downloads"
        exit 1
    fi
    
    # Check for bun
    if ! command -v bun &> /dev/null; then
        echo -e "${YELLOW}⚠️  Bun not found. Installing...${NC}"
        curl -fsSL https://bun.sh/install | bash
        
        # Source bun for this session
        if [ -f "$HOME/.bashrc" ]; then
            export BUN_INSTALL="$HOME/.bun"
            export PATH="$BUN_INSTALL/bin:$PATH"
        fi
        
        if ! command -v bun &> /dev/null; then
            echo -e "${RED}❌ Failed to install Bun. Please install manually:${NC}"
            echo "   curl -fsSL https://bun.sh/install | bash"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ All dependencies installed${NC}"
}

# Install CLI from source
install_cli() {
    echo ""
    echo -e "${BLUE}📦 Installing VESC CLI...${NC}"
    echo "========================"
    
    # Clone repository
    echo -e "${CYAN}⬇️  Cloning repository...${NC}"
    cd "$TEMP_DIR"
    git clone --depth 1 "https://github.com/$REPO_OWNER/$REPO_NAME.git" .
    
    # Install dependencies
    echo -e "${CYAN}📥 Installing dependencies...${NC}"
    bun install
    
    # Build
    echo -e "${CYAN}🔨 Building...${NC}"
    bun run build
    
    # Create install directory
    mkdir -p "$INSTALL_DIR"
    
    # Create wrapper script for the CLI
    cat > "$INSTALL_DIR/$BINARY_NAME" << 'EOF'
#!/bin/bash
# VESC CLI wrapper script
VEAC_DIR="$HOME/.veac"
if [ -d "$VEAC_DIR" ]; then
    cd "$VEAC_DIR"
    bun run apps/cli/src/index.ts "$@"
else
    echo "Error: VESC CLI not found at $VEAC_DIR"
    echo "Please reinstall: curl -sSL https://raw.githubusercontent.com/Can-0f-Tuna/veac/main/install.sh | bash"
    exit 1
fi
EOF
    chmod +x "$INSTALL_DIR/$BINARY_NAME"
    
    # Install to permanent location
    echo -e "${CYAN}📦 Installing to $HOME/.veac...${NC}"
    if [ -d "$HOME/.veac" ]; then
        rm -rf "$HOME/.veac"
    fi
    cp -r "$TEMP_DIR" "$HOME/.veac"
    
    # Create 'vesc' alias
    if [ -f "$INSTALL_DIR/vesc" ]; then
        rm "$INSTALL_DIR/vesc"
    fi
    ln -sf "$INSTALL_DIR/$BINARY_NAME" "$INSTALL_DIR/vesc"
    
    echo -e "${GREEN}✅ CLI installed successfully${NC}"
    
    # Test installation
    echo -e "${CYAN}🧪 Testing installation...${NC}"
    if "$INSTALL_DIR/$BINARY_NAME" --version &>/dev/null; then
        VERSION=$("$INSTALL_DIR/$BINARY_NAME" --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ CLI version: $VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  Note: CLI will be available after restarting your terminal${NC}"
    fi
}

# Install skill
install_skill() {
    echo ""
    echo -e "${BLUE}🎓 Installing VESC CLI Skill...${NC}"
    echo "=============================="
    
    # Check if bunx is available
    if ! command -v bunx &> /dev/null && ! command -v npx &> /dev/null; then
        echo -e "${YELLOW}⚠️  bunx/npx not available${NC}"
        echo "Skill installation requires bunx. Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
    fi
    
    # Determine which command to use
    if command -v bunx &> /dev/null; then
        INSTALLER="bunx"
    elif command -v npx &> /dev/null; then
        INSTALLER="npx"
    else
        echo -e "${YELLOW}⚠️  Could not find bunx or npx${NC}"
        echo "Manual skill installation:"
        echo "  bunx skills add https://github.com/$REPO_OWNER/$REPO_NAME.git --skill vesc-cli-skill"
        return 1
    fi
    
    # Install the skill
    echo -e "${CYAN}⬇️  Installing skill using $INSTALLER...${NC}"
    
    if $INSTALLER skills add "https://github.com/$REPO_OWNER/$REPO_NAME.git" --skill vesc-cli-skill 2>/dev/null; then
        echo -e "${GREEN}✅ Skill installed successfully${NC}"
        echo ""
        echo -e "${CYAN}📝 To use the skill, mention VESC in your prompt:${NC}"
        echo "   'I want to set up my VESC controller'"
        echo "   'Help me configure my motor'"
        return 0
    else
        echo -e "${YELLOW}⚠️  Automatic skill installation may have failed${NC}"
        echo ""
        echo -e "${CYAN}Manual installation:${NC}"
        echo "   bunx skills add https://github.com/$REPO_OWNER/$REPO_NAME.git --skill vesc-cli-skill"
        echo ""
        echo -e "${CYAN}Or clone and manually add:${NC}"
        echo "   git clone https://github.com/$REPO_OWNER/$REPO_NAME.git"
        echo "   cd veac/vesc-cli-skill"
        return 1
    fi
}

# Setup PATH
setup_path() {
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
}

# Dev mode - clone full repo for development
install_dev() {
    echo ""
    echo -e "${BLUE}🛠️  Development Mode${NC}"
    echo "===================="
    
    DEV_DIR="${1:-$HOME/veac-dev}"
    
    echo -e "${CYAN}📥 Cloning to $DEV_DIR...${NC}"
    git clone "https://github.com/$REPO_OWNER/$REPO_NAME.git" "$DEV_DIR"
    
    cd "$DEV_DIR"
    
    echo -e "${CYAN}📦 Installing dependencies...${NC}"
    bun install
    
    echo -e "${CYAN}🔨 Building...${NC}"
    bun run build
    
    echo ""
    echo -e "${GREEN}✅ Development environment ready at $DEV_DIR${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "   cd $DEV_DIR"
    echo "   bun run dev"
    echo ""
    
    # Also install the skill
    install_skill
}

# Main installation flow
main() {
    detect_platform
    
    if [ "$DEV_MODE" = true ]; then
        install_dev "$2"
        exit 0
    fi
    
    check_dependencies
    
    if [ "$SKILL_ONLY" = true ]; then
        install_skill
    else
        install_cli
        
        if [ "$CLI_ONLY" = false ]; then
            install_skill
        fi
    fi
    
    setup_path
    
    # Success message
    echo ""
    echo -e "${GREEN}🎉 Installation Complete!${NC}"
    echo "======================"
    echo ""
    
    if [ "$SKILL_ONLY" = false ]; then
        echo -e "${CYAN}CLI Commands:${NC}"
        echo "  veac --help              Show CLI help"
        echo "  veac device list-ports   List VESC devices"
        echo "  veac motor get-values    Get motor telemetry"
        echo "  veac motor stop          Stop motor"
        echo ""
    fi
    
    if [ "$CLI_ONLY" = false ]; then
        echo -e "${CYAN}Skill Usage:${NC}"
        echo "  Just mention VESC in your prompt:"
        echo "    'I want to configure my VESC controller'"
        echo "    'Help me set up my motor'"
        echo ""
    fi
    
    echo -e "${YELLOW}Note: Restart your terminal or run 'source ~/.bashrc' (or ~/.zshrc)${NC}"
    echo ""
}

# Run main function
main "$@"
