# VESC CLI Context

## What is VESC?

VESC (Vedder Electronic Speed Controller) is an open-source motor controller platform created by Benjamin Vedder. It's widely used for:
- Electric vehicles (skateboards, bikes, scooters, cars)
- Robotics and automation
- Drones and aerospace
- Industrial motor control
- Research and development

## Key Concepts

### Motor Control Modes
- **FOC** (Field-Oriented Control): Advanced, efficient, quiet operation
- **BLDC**: Traditional trapezoidal control, simpler
- **DC**: Brushed DC motor control

### VESC Components
- **Motor Configuration (MCConf)**: Motor-specific parameters
- **Application Configuration (AppConf)**: Control input settings
- **Custom Configuration**: Hardware-specific parameters
- **LispBM**: Embedded scripting language for custom logic

### Communication
- **USB/Serial**: Direct connection via USB CDC or UART
- **CAN Bus**: Multi-device networking (up to 253 devices)
- **Bluetooth**: Wireless connection (with appropriate hardware)
- **TCP/UDP**: Network connection via TCP hub

### Important Parameters
- **Current Limits**: Motor and battery current limits (safety-critical)
- **Voltage Limits**: Battery cutoffs (prevent battery damage)
- **Temperature Limits**: MOSFET and motor temperature protection
- **ERPM Limits**: Electrical RPM limits

## Safety Considerations

### Physical Safety
- VESCs control high-power motors that can cause injury
- Always ensure motor can spin freely during detection
- Keep emergency stop accessible
- Use appropriate current limits for your hardware

### Hardware Protection
- **Never exceed battery voltage ratings**
- **Respect current limits** of your motor and battery
- **Temperature monitoring** prevents fires
- **Proper cooling** is essential for high-power applications

### Common Mistakes
1. Wrong motor type selection (BLDC vs FOC)
2. Incorrect current limits (too high = damage, too low = poor performance)
3. Battery voltage cutoffs not set (risk of battery damage)
4. Skipping motor detection (poor performance or instability)

## Typical Workflows

### New Motor Setup
1. **Connect and identify** - Get firmware version and hardware info
2. **Configure voltage limits** - Set battery type and cutoffs
3. **Configure current limits** - Set based on motor and battery specs
4. **Run motor detection** - Let VESC measure motor parameters
5. **Test and tune** - Verify operation, adjust as needed

### Configuration Management
1. **Backup existing config** - Always backup before changes
2. **Make changes incrementally** - One parameter at a time
3. **Test after each change** - Verify system still works
4. **Document changes** - Keep track of what was modified

### Troubleshooting
1. **Check fault codes** - VESC reports specific fault conditions
2. **Monitor temperatures** - Overheating causes performance issues
3. **Verify connections** - Loose wires cause intermittent problems
4. **Review logs** - Terminal output often reveals issues

## Integration Points

### For AI Agents
- Use `--format json` for all operations
- Parse fault codes programmatically
- Implement retry logic for transient errors
- Monitor temperatures and current continuously
- Log all operations for debugging

### For Automation
- Use `--dry-run` for config changes
- Implement idempotent operations
- Handle exit codes appropriately
- Use `--yes` flag to skip confirmations
- Redirect stderr to logs for debugging

### For CI/CD
- Automated motor testing after firmware updates
- Configuration validation in pipelines
- Regression testing of control algorithms
- Performance benchmarking

## Resources

- **VESC Project**: https://vesc-project.com/
- **Firmware Source**: https://github.com/vedderb/bldc
- **VESC Tool**: https://github.com/vedderb/vesc_tool
- **Documentation**: https://vedderb-bldc.mintlify.app/
- **Forum**: https://vesc-project.com/forum

## License

VESC is open source under GPL v3. The CLI tool follows the same license.
