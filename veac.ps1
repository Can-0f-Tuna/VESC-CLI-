#!/usr/bin/env pwsh
# veac.ps1 - VESC CLI wrapper script for PowerShell
# This script runs the veac CLI from the local project source

$ProjectPath = "C:\Users\User\OneDrive\Desktop\michael.2\Projects\veac"
$CliSource = "$ProjectPath\apps\cli\src\index.ts"

# Run the CLI with all arguments passed through
& bun run "$CliSource" @args
