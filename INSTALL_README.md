# Quick Install

## Windows (One Command)

### Option 1: Double-click (Easiest)
1. Double-click `install.bat`
2. Wait for installation (this may take a few minutes while Rust builds the project)
3. Restart your terminal
4. Type `vesc` in terminal

### Option 2: PowerShell
```powershell
.\install.ps1
```

### Option 3: Command Line
```cmd
install.bat
```

After installation, restart your terminal and type:
```
vesc --help
```

## What Gets Installed

| Component | Location |
|-----------|----------|
| Main Binary | `%USERPROFILE%\.vesc-cli\bin\veac.exe` |
| Alias | `%USERPROFILE%\.vesc-cli\bin\vesc.exe` (so you can type "vesc") |
| CMD Wrapper | `%USERPROFILE%\.vesc-cli\bin\vesc.cmd` |
| PATH | Automatically added to user PATH |
| Rust | Auto-installed if not present |

## Troubleshooting

### "vesc is not recognized"
**Solution**: Restart your terminal or refresh PATH:
- If you have Chocolatey: run `refreshenv`
- In PowerShell: `$env:PATH = [Environment]::GetEnvironmentVariable("Path", "User")`
- Or simply close and reopen your terminal

### "cargo not found"
**Solution**: 
1. Rust installation failed or didn't update PATH
2. Install Rust manually from https://rustup.rs/
3. Restart your terminal after installation

### Build fails with linker errors
**Solution**: 
1. Install Visual Studio Build Tools or Visual Studio Community
2. Make sure "Desktop development with C++" workload is installed
3. Restart and run installer again

### Permission denied
**Solution**: 
- The installer works in user mode - no admin required
- If you see permission errors, check that `%USERPROFILE%` is accessible

## Quick Start After Install

```bash
# List available VESC devices
vesc device list-ports

# Get device info
vesc device info

# Connect to a VESC
vesc device connect --port COM3

# Get motor telemetry
vesc motor get-values

# Stop motor
vesc motor stop

# Show all available commands
vesc schema
```

## Uninstall

To remove VESC CLI:

```powershell
# Remove the installation directory
Remove-Item -Recurse -Force "$env:USERPROFILE\.vesc-cli"

# Remove from PATH (manual step via System Properties > Environment Variables)
```

## Development

To rebuild after code changes:

```powershell
# Force reinstall with latest code
.\install.ps1 -Force
```
