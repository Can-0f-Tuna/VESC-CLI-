#!/usr/bin/env node
/**
 * VESC CLI (veac) Universal Installer
 * 
 * One-command installer that installs both the CLI tool and the agent skill.
 * 
 * Usage:
 *   curl -fsSL https://raw.githubusercontent.com/Can-0f-Tuna/veac/main/install.mjs | bun run
 *   curl -fsSL https://raw.githubusercontent.com/Can-0f-Tuna/veac/main/install.mjs | node
 *   npx veac-install
 *   bunx veac-install
 *   node install.mjs
 * 
 * Options:
 *   --cli-only    Install only the CLI tool
 *   --skill-only  Install only the skill
 *   --dev         Clone for development (full repo)
 *   --verbose     Show detailed output
 * 
 * @version 0.1.0
 * @license GPL-3.0
 */

import { execSync, spawn } from 'child_process';
import { mkdtempSync, rmSync, mkdirSync, cpSync, writeFileSync, chmodSync, existsSync, readFileSync } from 'fs';
import { tmpdir, homedir, platform } from 'os';
import { join, resolve } from 'path';

// =============================================================================
// CONFIGURATION
// =============================================================================

const REPO_OWNER = 'Can-0f-Tuna';
const REPO_NAME = 'veac';
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}.git`;
const INSTALL_DIR = join(homedir(), '.local', 'bin');
const PERMANENT_DIR = join(homedir(), '.veac');
const BINARY_NAME = 'veac';
const SKILL_NAME = 'vesc-cli-skill';

// =============================================================================
// ANSI COLOR CODES
// =============================================================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  cyan: '\x1b[0;36m',
  blue: '\x1b[0;34m',
  magenta: '\x1b[0;35m',
  gray: '\x1b[0;90m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Print a colored message to stdout */
function print(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/** Print a formatted section header */
function header(title) {
  console.log('');
  print('blue', `${title}`);
  print('blue', '='.repeat(title.length));
}

/** Print a success message */
function success(message) {
  print('green', `[OK] ${message}`);
}

/** Print a warning message */
function warn(message) {
  print('yellow', `[WARN] ${message}`);
}

/** Print an error message and exit */
function error(message, exitCode = 1) {
  print('red', `[ERROR] ${message}`);
  process.exit(exitCode);
}

/** Print an info message */
function info(message) {
  print('cyan', `[INFO] ${message}`);
}

/** Execute a shell command with optional timeout */
async function exec(command, args = [], options = {}) {
  const { 
    cwd = process.cwd(), 
    timeout = 120000, 
    silent = false,
    verbose = false 
  } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: verbose ? 'inherit' : silent ? 'pipe' : 'pipe',
      shell: platform() === 'win32'
    });

    let stdout = '';
    let stderr = '';

    if (!verbose) {
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

/** Execute a command synchronously (for simple operations) */
function execSyncSafe(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (err) {
    if (options.ignoreError) {
      return null;
    }
    throw err;
  }
}

/** Check if a command exists in PATH */
function commandExists(command) {
  try {
    const checkCmd = platform() === 'win32' 
      ? `where ${command}` 
      : `command -v ${command}`;
    execSync(checkCmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/** Get the version of a command */
function getCommandVersion(command, versionFlag = '--version') {
  try {
    const output = execSync(`${command} ${versionFlag}`, { 
      encoding: 'utf-8', 
      stdio: 'pipe' 
    });
    return output.trim();
  } catch {
    return null;
  }
}

// =============================================================================
// ENVIRONMENT DETECTION
// =============================================================================

/** Detect available runtime (Bun preferred, fallback to Node.js) */
function detectRuntime() {
  // Check for Bun first (preferred)
  if (commandExists('bun')) {
    const version = getCommandVersion('bun');
    return { type: 'bun', command: 'bun', version };
  }

  // Fallback to Node.js
  if (commandExists('node')) {
    const version = getCommandVersion('node');
    return { type: 'node', command: 'node', version };
  }

  return null;
}

/** Detect package manager availability (for linking) */
function detectPackageManager() {
  const managers = [];
  
  if (commandExists('bun')) {
    managers.push({ type: 'bun', command: 'bun', version: getCommandVersion('bun') });
  }
  
  if (commandExists('npm')) {
    managers.push({ type: 'npm', command: 'npm', version: getCommandVersion('npm') });
  }
  
  if (commandExists('pnpm')) {
    managers.push({ type: 'pnpm', command: 'pnpm', version: getCommandVersion('pnpm') });
  }

  return managers;
}

/** Detect if running in a CI environment */
function isCI() {
  return process.env.CI || 
         process.env.CONTINUOUS_INTEGRATION || 
         process.env.GITHUB_ACTIONS ||
         process.env.GITLAB_CI ||
         process.env.TRAVIS ||
         process.env.CIRCLECI;
}

/** Get current platform info */
function getPlatformInfo() {
  const os = platform();
  const arch = process.arch;
  return { os, arch, isWindows: os === 'win32', isMac: os === 'darwin', isLinux: os === 'linux' };
}

// =============================================================================
// INSTALLATION STEPS
// =============================================================================

/** Step 1: Check and install dependencies (Git, Bun/Node) */
async function checkDependencies(runtime, verbose) {
  header('[1/8] Checking Dependencies');

  // Check Git
  if (!commandExists('git')) {
    error('Git is required but not installed.\nPlease install Git: https://git-scm.com/downloads');
  }
  success('Git is available');

  // Check runtime
  if (!runtime) {
    print('yellow', 'Neither Bun nor Node.js found. Installing Bun...');
    
    try {
      // Install Bun using the official installer
      const installScript = 'curl -fsSL https://bun.sh/install | bash';
      if (platform() !== 'win32') {
        execSyncSafe(installScript, { timeout: 120000 });
        
        // Add Bun to PATH for this session
        const bunInstallDir = join(homedir(), '.bun');
        process.env.BUN_INSTALL = bunInstallDir;
        process.env.PATH = `${join(bunInstallDir, 'bin')}${platform() === 'win32' ? ';' : ':'}${process.env.PATH}`;
        
        // Re-check
        if (!commandExists('bun')) {
          throw new Error('Bun installation verification failed');
        }
        
        success('Bun installed successfully');
        return detectRuntime();
      } else {
        error('Please install Bun manually on Windows:\n  powershell -c "irm bun.sh/install.ps1|iex"');
      }
    } catch (err) {
      error(`Failed to install Bun: ${err.message}\nPlease install manually: curl -fsSL https://bun.sh/install | bash`);
    }
  } else {
    success(`${runtime.type} is available (${runtime.version})`);
  }

  return runtime;
}

/** Step 2: Create temporary directory for cloning */
function createTempDir() {
  const tempDir = mkdtempSync(join(tmpdir(), 'veac-install-'));
  return tempDir;
}

/** Step 3: Clone the repository */
async function cloneRepository(tempDir, verbose) {
  header('[2/8] Cloning Repository');
  
  try {
    await exec('git', ['clone', '--depth', '1', REPO_URL, '.'], {
      cwd: tempDir,
      verbose,
      timeout: 60000
    });
    success(`Repository cloned to ${tempDir}`);
  } catch (err) {
    error(`Failed to clone repository: ${err.message}`);
  }
}

/** Step 4: Install dependencies */
async function installDependencies(tempDir, runtime, verbose) {
  header('[3/8] Installing Dependencies');
  
  try {
    if (runtime.type === 'bun') {
      await exec('bun', ['install'], { cwd: tempDir, verbose, timeout: 120000 });
    } else {
      await exec('npm', ['install'], { cwd: tempDir, verbose, timeout: 120000 });
    }
    success('Dependencies installed');
  } catch (err) {
    error(`Failed to install dependencies: ${err.message}`);
  }
}

/** Step 5: Build the project */
async function buildProject(tempDir, runtime, verbose) {
  header('[4/8] Building Project');
  
  try {
    if (runtime.type === 'bun') {
      await exec('bun', ['run', 'build'], { cwd: tempDir, verbose, timeout: 120000 });
    } else {
      await exec('npm', ['run', 'build'], { cwd: tempDir, verbose, timeout: 120000 });
    }
    success('Project built successfully');
  } catch (err) {
    error(`Failed to build project: ${err.message}`);
  }
}

/** Step 6: Install CLI globally using link */
async function installCLI(tempDir, managers, verbose) {
  header('[5/8] Installing CLI Globally');

  // Create install directory
  mkdirSync(INSTALL_DIR, { recursive: true });

  // Check if already installed
  if (existsSync(PERMANENT_DIR)) {
    warn('Existing installation found at ' + PERMANENT_DIR);
    info('Removing old installation...');
    rmSync(PERMANENT_DIR, { recursive: true, force: true });
  }

  // Copy to permanent location
  try {
    cpSync(tempDir, PERMANENT_DIR, { recursive: true });
    success(`CLI installed to ${PERMANENT_DIR}`);
  } catch (err) {
    error(`Failed to copy installation: ${err.message}`);
  }

  // Create wrapper script
  const isWindows = platform() === 'win32';
  const wrapperPath = join(INSTALL_DIR, isWindows ? 'veac.cmd' : 'veac');
  
  if (isWindows) {
    // Windows batch wrapper
    const wrapperContent = `@echo off
REM VESC CLI wrapper script for Windows
cd /d "${PERMANENT_DIR.replace(/\//g, '\\')}"
if exist "apps\\cli\\src\\index.ts" (
  bun run apps\\cli\\src\\index.ts %*
) else (
  echo Error: VESC CLI not found at ${PERMANENT_DIR}
  exit /b 1
)
`;
    writeFileSync(wrapperPath, wrapperContent);
  } else {
    // Unix shell wrapper
    const wrapperContent = `#!/bin/bash
# VESC CLI wrapper script
VEAC_DIR="${PERMANENT_DIR}"
if [ -d "$VEAC_DIR" ]; then
    cd "$VEAC_DIR"
    bun run apps/cli/src/index.ts "$@"
else
    echo "Error: VESC CLI not found at $VEAC_DIR"
    exit 1
fi
`;
    writeFileSync(wrapperPath, wrapperContent);
    chmodSync(wrapperPath, 0o755);
  }

  success(`CLI wrapper created at ${wrapperPath}`);

  // Also create 'vesc' alias
  const aliasPath = join(INSTALL_DIR, isWindows ? 'vesc.cmd' : 'vesc');
  if (isWindows) {
    writeFileSync(aliasPath, readFileSync(wrapperPath));
  } else {
    try {
      // Try to create symlink, fallback to copy
      const { symlinkSync } = await import('fs');
      symlinkSync(wrapperPath, aliasPath);
    } catch {
      cpSync(wrapperPath, aliasPath);
      chmodSync(aliasPath, 0o755);
    }
  }
  success(`Alias 'vesc' created`);

  // Attempt to link using package manager (optional)
  const bunManager = managers.find(m => m.type === 'bun');
  const npmManager = managers.find(m => m.type === 'npm');

  if (bunManager) {
    try {
      info('Attempting to link with Bun...');
      await exec('bun', ['link'], { 
        cwd: join(PERMANENT_DIR, 'apps', 'cli'), 
        silent: true,
        timeout: 30000 
      });
      success('Bun link successful');
    } catch {
      warn('Bun link failed, using wrapper script instead');
    }
  } else if (npmManager) {
    try {
      info('Attempting to link with npm...');
      await exec('npm', ['link', '-g'], { 
        cwd: join(PERMANENT_DIR, 'apps', 'cli'), 
        silent: true,
        timeout: 30000 
      });
      success('npm link successful');
    } catch {
      warn('npm link failed, using wrapper script instead');
    }
  }
}

/** Check if the 'skills' CLI tool exists */
async function skillsCliExists(installer) {
  try {
    // Try to run 'skills --version' or similar to check if it exists
    await exec(installer, ['skills', '--version'], { silent: true, timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/** Get the skill installation directory */
function getSkillDir() {
  return join(homedir(), '.agents', 'skills', SKILL_NAME);
}

/** Manually install skill by copying from temp directory */
function installSkillManually(tempDir) {
  const skillSourceDir = join(tempDir, SKILL_NAME);
  const skillTargetDir = getSkillDir();

  // Check if skill exists in temp directory
  if (!existsSync(skillSourceDir)) {
    throw new Error(`Skill directory not found at ${skillSourceDir}`);
  }

  // Create parent directories if needed
  mkdirSync(join(homedir(), '.agents', 'skills'), { recursive: true });

  // Remove existing skill installation if present
  if (existsSync(skillTargetDir)) {
    info('Removing existing skill installation...');
    rmSync(skillTargetDir, { recursive: true, force: true });
  }

  // Copy skill directory
  cpSync(skillSourceDir, skillTargetDir, { recursive: true });

  // Verify installation
  if (!existsSync(join(skillTargetDir, 'SKILL.md'))) {
    throw new Error('Skill installation verification failed - SKILL.md not found');
  }

  return skillTargetDir;
}

/** Step 7: Install the skill */
async function installSkill(managers, verbose, tempDir = null) {
  header('[6/8] Installing VESC CLI Skill');

  // Determine which installer to use
  const installer = managers.find(m => m.type === 'bun') 
    ? 'bunx' 
    : managers.find(m => m.type === 'npm') 
      ? 'npx' 
      : null;

  // First, try the skills CLI if available
  if (installer) {
    const hasSkillsCli = await skillsCliExists(installer);
    
    if (hasSkillsCli) {
      try {
        info(`Installing skill using ${installer} skills...`);
        await exec(installer, ['skills', 'add', REPO_URL, '--skill', SKILL_NAME], {
          timeout: 60000,
          verbose
        });
        success('Skill installed successfully via skills CLI');
        return true;
      } catch (err) {
        warn(`Skills CLI installation failed: ${err.message}`);
        info('Falling back to manual installation...');
      }
    } else {
      info(`Skills CLI not available via ${installer}, using manual installation...`);
    }
  } else {
    info('No bunx/npx available, using manual installation...');
  }

  // Manual fallback: Copy skill files directly
  if (tempDir && existsSync(tempDir)) {
    try {
      info('Installing skill manually...');
      const skillDir = installSkillManually(tempDir);
      success(`Skill installed to ${skillDir}`);
      
      print('cyan', '\nSkill installation complete!');
      print('dim', `The skill is now available at: ${skillDir}`);
      print('dim', 'Your agent should automatically detect this skill.');
      
      return true;
    } catch (err) {
      warn(`Manual installation failed: ${err.message}`);
    }
  }

  // If we get here, both methods failed - provide clear instructions
  warn('Automatic skill installation failed');
  
  print('cyan', '\nManual Skill Installation Instructions:');
  print('reset', '');
  print('reset', 'Option 1 - Using skills CLI (if available):');
  print('reset', `  ${installer || 'bunx'} skills add ${REPO_URL} --skill ${SKILL_NAME}`);
  print('reset', '');
  print('reset', 'Option 2 - Manual copy:');
  print('reset', '  1. Clone the repository:');
  print('reset', `     git clone --depth 1 ${REPO_URL}`);
  print('reset', '  2. Copy the skill folder:');
  const targetPath = getSkillDir();
  if (platform() === 'win32') {
    print('reset', `     xcopy /E /I ${REPO_NAME}\\${SKILL_NAME} ${targetPath.replace(/\//g, '\\')}`);
  } else {
    print('reset', `     cp -r ${REPO_NAME}/${SKILL_NAME} ${targetPath}`);
  }
  print('reset', '');
  print('cyan', 'The skill provides VESC controller knowledge and guided setup workflows.');
  
  return false;
}

/** Step 8: Setup PATH if needed */
function setupPath() {
  const currentPath = process.env.PATH || '';
  const pathSeparator = platform() === 'win32' ? ';' : ':';
  
  if (!currentPath.split(pathSeparator).includes(INSTALL_DIR)) {
    header('[WARNING] PATH Configuration Required');
    
    const shell = process.env.SHELL;
    let configFile;
    
    if (shell) {
      if (shell.includes('zsh')) {
        configFile = join(homedir(), '.zshrc');
      } else if (shell.includes('bash')) {
        configFile = join(homedir(), '.bashrc');
      } else if (shell.includes('fish')) {
        configFile = join(homedir(), '.config', 'fish', 'config.fish');
      }
    }
    
    if (!configFile) {
      configFile = platform() === 'win32' 
        ? 'Environment Variables (System Properties)'
        : join(homedir(), '.profile');
    }

    warn(`${INSTALL_DIR} is not in your PATH`);
    print('cyan', 'Add this to your configuration:');
    print('reset', `  export PATH="${INSTALL_DIR}:$PATH"`);
    print('cyan', 'Or run this command:');
    print('reset', `  echo 'export PATH="${INSTALL_DIR}:\$PATH"' >> ${configFile}`);
  }
}

/** Step 9: Verify installation */
async function verifyInstallation() {
  header('[7/8] Verifying Installation');
  
  const wrapperPath = join(INSTALL_DIR, platform() === 'win32' ? 'veac.cmd' : 'veac');
  
  if (existsSync(wrapperPath)) {
    try {
      const { stdout } = await exec(wrapperPath, ['--version'], { silent: true, timeout: 10000 });
      success(`CLI is working (version: ${stdout.trim()})`);
      return true;
    } catch (err) {
      warn(`CLI wrapper exists but may need PATH refresh: ${err.message}`);
      return false;
    }
  } else {
    warn('CLI wrapper not found at expected location');
    return false;
  }
}

// =============================================================================
// DEV MODE
// =============================================================================

/** Development mode: Clone full repo for development */
async function installDev(runtime, verbose) {
  const devDir = resolve(process.argv.find(arg => !arg.startsWith('--')) || join(homedir(), 'veac-dev'));
  
  header('[Development Mode]');
  
  if (existsSync(devDir)) {
    warn(`Directory ${devDir} already exists`);
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('Remove and re-clone? (y/N): ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() === 'y') {
      rmSync(devDir, { recursive: true, force: true });
    } else {
      info('Using existing directory');
    }
  }

  try {
    info(`Cloning to ${devDir}...`);
    await exec('git', ['clone', REPO_URL, devDir], { verbose, timeout: 60000 });
    success('Repository cloned');

    info('Installing dependencies...');
    if (runtime.type === 'bun') {
      await exec('bun', ['install'], { cwd: devDir, verbose, timeout: 120000 });
    } else {
      await exec('npm', ['install'], { cwd: devDir, verbose, timeout: 120000 });
    }
    success('Dependencies installed');

    info('Building project...');
    if (runtime.type === 'bun') {
      await exec('bun', ['run', 'build'], { cwd: devDir, verbose, timeout: 120000 });
    } else {
      await exec('npm', ['run', 'build'], { cwd: devDir, verbose, timeout: 120000 });
    }
    success('Project built');

    print('green', `\n[SUCCESS] Development environment ready at ${devDir}`);
    print('cyan', 'Next steps:');
    print('reset', `  cd ${devDir}`);
    print('reset', '  bun run dev');
    
  } catch (err) {
    error(`Development setup failed: ${err.message}`);
  }
}

// =============================================================================
// CLEANUP
// =============================================================================

/** Cleanup temporary directory */
function cleanup(tempDir) {
  if (tempDir && existsSync(tempDir)) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
      // Silent cleanup failure
    }
  }
}

// =============================================================================
// MAIN INSTALLATION FLOW
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const cliOnly = args.includes('--cli-only');
  const skillOnly = args.includes('--skill-only');
  const devMode = args.includes('--dev');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const help = args.includes('--help') || args.includes('-h');

  // Show help
  if (help) {
    console.log(`
${colors.cyan}VESC CLI (veac) Installer${colors.reset}
${colors.gray}One-command installer for the VESC CLI and agent skill${colors.reset}

${colors.bold}Usage:${colors.reset}
  node install.mjs [options]
  bunx github:${REPO_OWNER}/${REPO_NAME}/install
  npx github:${REPO_OWNER}/${REPO_NAME}/install

${colors.bold}Options:${colors.reset}
  --cli-only      Install only the CLI tool
  --skill-only    Install only the skill
  --dev           Clone for development (full repo)
  --verbose, -v   Show detailed output
  --help, -h      Show this help message

${colors.bold}Examples:${colors.reset}
  # Install both CLI and skill
  bunx github:${REPO_OWNER}/${REPO_NAME}/install

  # Install only CLI
  node install.mjs --cli-only

  # Development setup
  node install.mjs --dev

${colors.bold}Repository:${colors.reset} ${REPO_URL}
    `);
    process.exit(0);
  }

  // Print welcome message
  console.log(`
${colors.cyan}[VESC CLI Installer]${colors.reset}
${colors.gray}===================${colors.reset}
  `);

  let tempDir = null;
  let runtime = detectRuntime();
  const managers = detectPackageManager();
  const platformInfo = getPlatformInfo();

  info(`Platform: ${platformInfo.os} (${platformInfo.arch})`);

  try {
    // Development mode
    if (devMode) {
      await installDev(runtime, verbose);
      return;
    }

    // Skill-only mode
    if (skillOnly) {
      // For skill-only mode, we need to clone first to get the skill files
      tempDir = createTempDir();
      await cloneRepository(tempDir, verbose);
      await installSkill(managers, verbose, tempDir);
      cleanup(tempDir);
      return;
    }

    // Full installation flow
    tempDir = createTempDir();
    
    // Step 1: Check dependencies
    runtime = await checkDependencies(runtime, verbose);
    
    // Step 2: Clone repository
    await cloneRepository(tempDir, verbose);
    
    // Step 3: Install dependencies
    await installDependencies(tempDir, runtime, verbose);
    
    // Step 4: Build project
    await buildProject(tempDir, runtime, verbose);
    
    // Step 5: Install CLI
    await installCLI(tempDir, managers, verbose);
    
    // Step 6: Install skill (unless --cli-only)
    if (!cliOnly) {
      await installSkill(managers, verbose, tempDir);
    }
    
    // Step 7: Setup PATH
    setupPath();
    
    // Step 8: Verify
    await verifyInstallation();

    // Success message
    console.log(`
${colors.green}[SUCCESS] Installation Complete!${colors.reset}
${colors.gray}=======================${colors.reset}
    `);

    if (!skillOnly) {
      print('cyan', 'CLI Commands:');
      print('reset', '  veac --help              Show CLI help');
      print('reset', '  veac device list-ports   List VESC devices');
      print('reset', '  veac motor get-values    Get motor telemetry');
      print('reset', '  veac motor stop          Stop motor');
      console.log('');
    }

    if (!cliOnly) {
      print('cyan', 'Skill Usage:');
      print('reset', '  Just mention VESC in your prompt:');
      print('reset', '    "I want to configure my VESC controller"');
      print('reset', '    "Help me set up my motor"');
      console.log('');
    }

    if (!isCI()) {
      print('yellow', 'Note: Restart your terminal or source your shell config to use `veac`');
    }

  } catch (err) {
    print('red', `\n[FAILED] Installation failed: ${err.message}`);
    if (verbose) {
      console.error(err.stack);
    }
    process.exit(1);
  } finally {
    cleanup(tempDir);
  }
}

// Run main function
main().catch(err => {
  console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});
