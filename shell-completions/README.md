# Shell Completions

This directory contains shell completion scripts for the VESC CLI.

## Available Completions

- `veac.bash` - Bash completions
- `_veac` - Zsh completions
- `veac.fish` - Fish completions
- `_veac.ps1` - PowerShell completions
- `veac.elv` - Elvish completions

## Generating Completions

You can generate completions using the CLI itself:

```bash
# Generate for your shell
veac generate-completions bash > shell-completions/veac.bash
veac generate-completions zsh > shell-completions/_veac
veac generate-completions fish > shell-completions/veac.fish
veac generate-completions powershell > shell-completions/_veac.ps1
veac generate-completions elvish > shell-completions/veac.elv
```

## Installation

### Bash

```bash
# System-wide
sudo cp shell-completions/veac.bash /etc/bash_completion.d/

# User-only
mkdir -p ~/.local/share/bash-completion/completions/
cp shell-completions/veac.bash ~/.local/share/bash-completion/completions/veac
```

### Zsh

```bash
# System-wide
sudo cp shell-completions/_veac /usr/share/zsh/site-functions/

# User-only (with oh-my-zsh)
cp shell-completions/_veac ~/.oh-my-zsh/completions/

# User-only (manual)
mkdir -p ~/.zsh/completions
cp shell-completions/_veac ~/.zsh/completions/
echo 'fpath+=(~/.zsh/completions)' >> ~/.zshrc
```

### Fish

```bash
# System-wide
sudo cp shell-completions/veac.fish /usr/share/fish/completions/

# User-only
mkdir -p ~/.config/fish/completions
cp shell-completions/veac.fish ~/.config/fish/completions/
```

### PowerShell

Add to your PowerShell profile:

```powershell
veac generate-completions powershell | Out-String | Invoke-Expression
```

Or save to a file and dot-source it:

```powershell
veac generate-completions powershell > $HOME\Documents\WindowsPowerShell\Completions\veac.ps1
# Add to profile:
# . $HOME\Documents\WindowsPowerShell\Completions\veac.ps1
```

### Elvish

```bash
mkdir -p ~/.config/elvish/lib
cp shell-completions/veac.elv ~/.config/elvish/lib/
# Add to rc.elv: use veac
```

## Features

The completion scripts provide:

- Command and subcommand completion
- Flag and option completion
- Value hints for common arguments
- Port name completion (where available)
- File path completion for config/script files

## Regenerating

Completions are automatically generated from the CLI definition.
If you add new commands or modify the CLI, regenerate:

```bash
cargo build --release
./target/release/veac generate-completions bash > shell-completions/veac.bash
# etc...
```
