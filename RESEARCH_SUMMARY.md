# CLI Creation Research Summary

## Internet Research Findings

### CLI Design Best Practices

From comprehensive research of modern CLI development guides:

#### 1. CLI Spec (clispec.dev) - Core Principles
- **Structured Output**: JSON when piped, human-friendly in TTY, support `--output` flag
- **Schema Introspection**: Provide `schema` command for capability discovery
- **Stderr/Stdout Separation**: Data to stdout, messages to stderr
- **Non-Interactive by Default**: Never block without TTY
- **Idempotent Operations**: Safe to retry commands
- **Bounded Output**: Pagination and field selection for large datasets

#### 2. Agent CLI Design Guide (Johnixr)
- **10 Key Principles**:
  1. Noun-verb command structure (`vesc motor set-rpm`)
  2. Long flags first (all flags must have `--long-form`)
  3. Structured output as API contract
  4. TTY-aware behavior (auto-detect terminal vs automation)
  5. Dry-run by default for side effects
  6. Semantic exit codes (0, 1, 2, 3, 10, etc.)
  7. Input validation and hallucination defense
  8. Idempotent operations
  9. Actionable error messages
  10. Help text is the agent's brain

#### 3. Framework Comparisons

**Node.js Options**:
- Commander.js: Most popular, simple API, 500M weekly downloads
- Yargs: Powerful validation, type coercion, middleware
- Oclif: Full framework from Salesforce, plugins, auto-updates

**Python Options**:
- Click: Standard for Python, decorator-based, clean API
- Typer: Built on Click, type hints drive CLI interface
- Argparse: Standard library, no dependencies

**Rust Options**:
- Clap: Dominant in Rust, derive macros, excellent docs
- StructOpt: Built on Clap (deprecated, merged into Clap v3)
- argh: Lightweight alternative

**Go Options**:
- Cobra: Industry standard, powers kubectl, hugo
- Viper: Configuration management companion to Cobra

### VESC Protocol Research

From official VESC documentation:

#### Communication Protocol
- **Interface**: USB CDC (virtual serial port) or UART
- **Default Baud**: 115200 bps
- **Format**: 8N1 (8 data bits, no parity, 1 stop bit)

#### Packet Structure
**Short Packet (≤255 bytes)**:
```
[0x02] [length:1] [payload:N] [CRC16:2] [0x03]
```

**Long Packet (256-512 bytes)**:
```
[0x03] [length:2] [payload:N] [CRC16:2] [0x03]
```

#### Command IDs (Key Commands)
```c
COMM_FW_VERSION = 0
COMM_JUMP_TO_BOOTLOADER = 1
COMM_ERASE_NEW_APP = 2
COMM_WRITE_NEW_APP_DATA = 3
COMM_GET_VALUES = 4
COMM_SET_DUTY = 5
COMM_SET_CURRENT = 6
COMM_SET_CURRENT_BRAKE = 7
COMM_SET_RPM = 8
COMM_SET_POS = 9
COMM_SET_HANDBRAKE = 10
COMM_SET_DETECT = 11
COMM_SET_SERVO_POS = 12
COMM_SET_MCCONF = 13
COMM_GET_MCCONF = 14
// ... 160+ commands total
```

#### Data Scaling
- Current: scaled by 1000 (10.5A → 10500)
- Duty cycle: scaled by 100000 (0.5 → 50000)
- RPM: sent as raw 32-bit integer

#### Existing Implementations
- **PyVESC**: Python library for VESC communication
- **VESC Tool**: Qt-based GUI (this project)
- **Arduino Libraries**: Multiple implementations

### VESC Tool Current State

From analyzing this codebase:

#### Existing CLI Commands (in main.cpp)
- `--vescPort [port]`: Specify serial port
- `--canFwd [id]`: CAN forwarding
- `--getMcConf [path]`: Read motor config to XML
- `--setMcConf [path]`: Write motor config from XML
- `--getAppConf [path]`: Read app config
- `--setAppConf [path]`: Write app config
- `--uploadLisp [path]`: Upload LispBM script
- `--reduceLisp`: Optimize Lisp file
- `--eraseLisp`: Erase Lisp
- `--uploadFirmware [path]`: Update firmware
- `--uploadBootloaderBuiltin`: Upload bootloader
- `--queryDeviceFwParams`: Get device info
- `--writeFileToSdCard [local:remote]`: File operations

#### Architecture
- **Commands class**: `commands.h/cpp` - VESC protocol implementation
- **Datatypes**: `datatypes.h` - 160+ command IDs, data structures
- **VescInterface**: Connection management
- **ConfigParams**: Configuration serialization

## Technology Recommendations

### Primary: Rust + Clap

**Why Rust**:
- Single static binary (easy distribution)
- ~1ms startup time
- Memory safety (no crashes from protocol errors)
- Excellent async support for streaming
- Cross-platform (Windows, macOS, Linux)

**Why Clap**:
- Derive macros reduce boilerplate
- Built-in help generation
- Shell completion support
- Schema generation capability
- Subcommand support
- Type-safe argument parsing

### Alternative: Python + Click/Typer

**When to use**:
- Rapid prototyping needed
- Team prefers Python
- Integration with existing Python ecosystem
- Acceptable to require Python runtime

**Trade-offs**:
- Slower startup (~50-100ms)
- Requires Python installation
- Easier to develop, harder to distribute

## Key Insights for AI-Agent CLI

### What Makes a CLI Agent-Friendly

1. **Discoverability**: `schema` command lets agents understand capabilities
2. **Reliability**: Structured output, predictable exit codes
3. **Safety**: --dry-run, idempotent operations
4. **Debugging**: Verbose mode, structured errors
5. **Integration**: JSON output, no interactive prompts in scripts

### Common Pitfalls to Avoid

1. **Interactive prompts in non-TTY** - AWS CLI v2 pager incident broke CI/CD
2. **Mixed stdout/stderr** - Corrupts piped JSON output
3. **Inconsistent exit codes** - Agent can't determine success/failure
4. **No schema introspection** - Agent must parse help text
5. **Non-idempotent operations** - Retries cause duplicate resources

### Success Metrics

An AI-agent CLI should allow this workflow:
```python
# 1. Discover capabilities
schema = run("vesc-cli schema")

# 2. Execute with confidence
result = run("vesc-cli motor set-rpm 5000 --format json")
if result.exit_code == 0:
    data = json.loads(result.stdout)
    print(f"Motor at {data['actual_rpm']} RPM")
else:
    error = json.loads(result.stderr)
    handle_error(error['kind'], error['message'])
```

## Next Action Items

### Immediate (Week 1)
1. ✅ Research completed - documented in this file
2. ✅ Architecture plan created - see CLI_TRANSFORMATION_PLAN.md
3. 🔄 Set up Rust project structure
4. 🔄 Implement VESC protocol (packet framing, CRC)
5. 🔄 Basic serial connection

### Short-term (Weeks 2-4)
6. Device discovery and connection
7. Core motor commands (get-values, set-rpm, set-current, stop)
8. Output formatting (JSON, table)
9. TTY detection and auto-format
10. Schema generation

### Medium-term (Weeks 5-8)
11. Configuration read/write
12. Motor detection workflows
13. Firmware updates
14. CAN bus operations
15. LispBM support

### Long-term (Weeks 9-12)
16. Real-time streaming/monitoring
17. Comprehensive testing
18. Documentation (AGENTS.md, CONTEXT.md)
19. Packaging and distribution
20. CI/CD integration examples

## Research Sources

1. **CLI Spec**: https://clispec.dev/
2. **Agent CLI Guide**: https://github.com/Johnixr/agent-cli-guide
3. **CLI Frameworks Guide**: https://www.devtoolsguide.com/cli-development-frameworks
4. **VESC Documentation**: https://vedderb-bldc.mintlify.app/
5. **VESC Protocol**: https://www.mintlify.com/vedderb/bldc/communication/uart-protocol
6. **PyVESC**: https://pyvesc.readthedocs.io/
7. **Clap Documentation**: https://docs.rs/clap/latest/clap/

---

**Research Date**: 2026-05-05
**Status**: Complete - Ready for implementation
