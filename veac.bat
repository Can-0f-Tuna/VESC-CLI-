@echo off
:: veac.bat - VESC CLI wrapper script for Windows Command Prompt
:: This script runs the veac CLI from the local project source

set "PROJECT_PATH=C:\Users\User\OneDrive\Desktop\michael.2\Projects\veac"
set "CLI_SOURCE=%PROJECT_PATH%\apps\cli\src\index.ts"

bun run "%CLI_SOURCE%" %*
