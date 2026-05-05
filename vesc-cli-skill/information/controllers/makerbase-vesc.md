# Makerbase VESC (75100 / 75200)

## Overview

**Makerbase** (MKS/Makerbase3D) produces a line of VESC-compatible motor controllers that have gained popularity for their competitive pricing and robust feature set. The MKSESC series (75100, 75200, etc.) offers high-voltage, high-current capabilities with aluminum PCB construction for improved thermal performance.

The Makerbase VESC series is particularly popular in the electric skateboard, scooter, and e-foil communities for offering VESC 75-series capabilities (high voltage and current) at more accessible price points than official hardware.

The V2 versions feature significant upgrades including phase filtering support and improved hardware design.

## Specifications

### Makerbase VESC 75100 V2

| Parameter | Value |
|-----------|-------|
| Model | MKSESC 75100 V2 |
| Microprocessor | ARM Cortex-M4 STM32F405RGT6 with FPU |
| Input Voltage | DC 14V-84V (4S-20S LiPo/LiIon) |
| Max Voltage | 84V |
| Continuous Current | 100A |
| Peak Current | 120A |
| ERPM Limit | 150,000 |
| MOSFETs | MDP10N027TH |
| Sampling Chip | INA241A (ultra-precision) |
| Sampling Method | Phase line sampling |
| PCB | Aluminum PCB (3oz copper) |
| PCB Size | 76.0mm x 45.5mm x 1.6mm |
| Shell Size | 85.3mm x 52.0mm x 38.0mm |
| Power/Motor Wire | 12AWG |
| Weight | ~200g+ |
| Firmware | V6.02 (VESC TOOL V6.02) |

### Makerbase VESC 75200 V2

| Parameter | Value |
|-----------|-------|
| Model | MKSESC 75200 V2 |
| Microprocessor | ARM Cortex-M4 STM32F405RGT6 with FPU |
| Input Voltage | DC 14V-84V (4S-20S LiPo/LiIon) |
| Max Voltage | 84V |
| Continuous Current | 200A (depends on external heat dissipation) |
| Peak Current | 300A |
| ERPM Limit | 150,000 |
| Sampling Chip | INA241A |
| Sampling Method | Phase line sampling |
| PCB | Aluminum PCB (3oz copper) |
| PCB Size | ~130mm x 67.7mm x 28.1mm (with heatsink) |
| Power/Motor Wire | 8AWG |
| Weight | ~400g+ |
| Firmware | V6.02 (VESC MKSESC_75200_V2) |

### Makerbase VESC 84100HP

| Parameter | Value |
|-----------|-------|
| Model | MKSESC 84100HP |
| Microprocessor | STM32F405RGT6 |
| Sampling Chip | INA241A |
| Input Voltage | DC 14V-84V (4S-20S LiPo) |
| Continuous Current | 100A |
| Peak Current | 200A |
| ERPM Limit | 150,000 |
| PCB | Aluminum with T2 tinned copper bars (2mm) |
| Power/Motor Wire | 8AWG |
| Shell Size | 93.0mm x 66.4mm x 28.0mm |
| Firmware | MKSESC_84_100_HP (V6.02) |

## Features

### Motor Control (All Versions)
- **FOC, BLDC, DC, GPD** motor type support
- **Three-phase splitter** with adjustable current/voltage filter
- **Phase line sampling** for accurate current measurement
- Sensored or sensorless operation
- Field weakening support for increased speed
- Duty cycle, speed, and current control modes
- Soft strategy for current limits and RPM restrictions
- Excellent startup performance in sensorless mode

### Hardware Features
- **ARM Cortex-M4 STM32F405RG** with FPU (floating point unit)
- **Aluminum PCB** construction for superior heat dissipation
- **3oz copper** PCB layers
- **INA241A** ultra-precision bidirectional current detection amplifier
- **T2 tinned copper bars** (2mm thick on 84100HP) for over-current capability
- **8AWG or 12AWG** wiring (model dependent)

### Sampling Technology
The Makerbase VESC series features advanced **phase line sampling**:
- **INA241A amplifier** with:
  - Gain error: ±0.01%
  - Offset voltage: ±10 µV
- Wider common mode voltage
- More reliable motor data detection
- Higher accuracy than battery-side sampling

### Sensor Support
- **ABI** encoder
- **HALL** sensors
- **AS5047** encoder
- **AS5048A** encoder
- Sensorless mode
- Hybrid mode operation

### Connectivity
- **USB Type-C** (built-in, PC connection to VESC Tool)
- **UART** (Bluetooth module support)
- **CAN bus**
- **PPM/PWM** (RC servo)
- **Analog (ADC)**
- **I2C**
- Built-in **Bluetooth module** (on V2 models)

### Power Outputs
- 5V output for external electronics
- 3.3V output for external electronics
- Current capabilities vary by model

### Control Features
- Multiple control interfaces: PPM, Analog, UART, I2C, USB, CAN
- Real-time monitoring via Bluetooth and mobile app
- Built-in current filter and phase filter (V2 models)
- One-click power on/off support
- Scheduled power off feature

### Protection Features
- Over-current protection
- High and low voltage protection
- Temperature control protection
- Adjustable speed limit protection
- Soft backoff strategies

## V2 Version Improvements

### Makerbase VESC 75100 V2
- **Aluminum PCB** for improved cooling
- **84V capability** (vs. lower voltage original)
- Updated firmware support
- Better thermal management

### Makerbase VESC 75200 V2 (Post-November 2023)
- **Phase filtering support** (Enable Phase Filters -> True)
- New hardware revision with filtering capability
- Factory firmware V6.02
- Firmware model: MKSESC_75200_V2

**Important Note**: Users who purchased before November 15, 2023 received the OLD version:
- Does NOT support phase filtering
- Must set "Enable Phase Filters -> False" in VESC Tool
- Recommended firmware: MKSESC_75200_V2_OLD

### Makerbase 75200 V2 Firmware Compatibility
| Version | Phase Filtering | Firmware Model |
|---------|-----------------|------------------|
| Old (pre-Nov 2023) | Not supported | MKSESC_75200_V2_OLD |
| New (post-Nov 2023) | Supported | MKSESC_75200_V2 |

## Use Cases

### Best For
- **Electric skateboards** (e-skate) - high voltage builds
- **Electric scooters** - 20S capable
- **E-foils** (electric hydrofoils) - high current marine use
- **Surfboards** - water sports applications
- **Fight robots** - combat robotics
- **AGV robots** - automated guided vehicles
- **E-bikes** - high-power conversions
- **Industrial applications** - high voltage motor control

### Recommended Applications by Model

**MKSESC 75100** (100A):
- Electric skateboards (single motor)
- E-bikes (mid-power)
- Scooters (1000-3000W systems)

**MKSESC 75200** (200A):
- E-foils (high current for water propulsion)
- Fight robots (weapon systems)
- High-performance e-skate
- Industrial machinery

**MKSESC 84100HP** (100A high performance):
- E-foils
- Surfboards
- AGV robots
- Applications requiring premium current handling

### Recommended Battery
- **4S to 20S LiPo/LiIon** (14.8V to 84V)
- **16S to 20S** for maximum performance (67.2V to 84V)
- High-discharge cells required for peak current
- Ensure battery BMS can handle discharge requirements

## Phase Filtering Important Warning

### For MKSESC 75100 V2
**CRITICAL**: Phase filtering is NOT available on MKSESC 75100 V2!

**Required Settings**:
- In VESC Tool: Set "Enable Phase Filters -> FALSE"
- Do NOT restore default parameters in wizard interface
- Applies to firmware version 5.3 and above (VESC TOOL 3.01+)

**Consequence of Incorrect Setting**: ESC damage may occur if phase filtering is enabled

### For MKSESC 75200 V2
**Pre-November 2023 Units**:
- Phase filtering: NOT supported
- Firmware model: Use MKSESC_75200_V2_OLD
- Setting: Enable Phase Filters -> False

**Post-November 2023 Units**:
- Phase filtering: Supported
- Factory firmware: V6.02
- Firmware model: MKSESC_75200_V2

## Firmware Compatibility

### Supported Firmware Models
| Model | Firmware Name | VESC Tool Version |
|-------|---------------|-------------------|
| 75100 V2 | MKSESC_75100_V2 | V6.02 |
| 75200 V2 (New) | MKSESC_75200_V2 | V6.02 |
| 75200 V2 (Old) | MKSESC_75200_V2_OLD | V5.2 / V3.0 |
| 84100HP | MKSESC_84_100_HP | V6.02 |

### Firmware Updates
- Available on Makerbase GitHub
- Update via VESC Tool
- Check hardware revision before updating
- Follow specific instructions for your hardware version

## Aluminum PCB Advantages

The Makerbase series uses **aluminum PCB construction**:
1. **Superior heat transfer** - Aluminum transfers heat much quicker than FR4
2. **Better thermal management** - Spreads heat across entire PCB
3. **Higher current capacity** - Can sustain higher continuous current
4. **Durability** - More robust construction

**Note**: Aluminum PCB improves heat transfer but does NOT eliminate the need for external cooling. Additional heatsinking may still be required for sustained high-current operation.

## Package Contents

### Typical Package (75100/75200)
- 1x MKSESC controller (with aluminum case/heatsink)
- 1x USB Type-C cable
- Accessory cables (varies by model)
- Manual

## Official Resources

- **Makerbase3D Website**: https://makerbase3d.com/
- **GitHub Repository**: https://github.com/makerbase-mks/VESC-MKS
- **Product Pages**:
  - 75100 V2: https://makerbase3d.com/product/makerbase-vesc-75100-v2/
  - 75200 V2: https://makerbase3d.com/product/makerbase-vesc-75200-v2/
- **VESC Project**: https://vesc-project.com/
- **VESC Tool**: https://vesc-project.com/vesc_tool

## Community Resources

- Makerbase VESC GitHub Wiki
- VESC Project Forums
- Electric skateboard and e-foil communities
- YouTube tutorials for setup and configuration

## Comparison with Official VESC

| Feature | Makerbase VESC | Official VESC 75/300 |
|---------|---------------|---------------------|
| Voltage | 84V | 75V |
| Current (75100) | 100A | - |
| Current (75200) | 200A | 300A |
| PCB | Aluminum | FR4 + aluminum case |
| Price | ~$90-130 | ~$300-400 |
| Build | Good | Premium |
| Support | Community | Official |
| Phase Filtering | Model dependent | Yes |

## Known Issues and Considerations

### Important Warnings
1. **Phase filtering** - Must be disabled on 75100 V2
2. **Firmware compatibility** - Check hardware revision before updates
3. **Temperature** - Aluminum PCB helps but external cooling may still be needed
4. **Quality variation** - Some variance between production batches

### Recommendations
- Verify hardware revision when purchasing
- Always disable phase filtering on 75100 V2
- Use appropriate firmware model for your hardware
- Ensure adequate cooling for continuous operation
- Follow Makerbase GitHub for firmware updates

## Sources

1. Makerbase3D Official Product Pages - https://makerbase3d.com/
2. Makerbase VESC GitHub - https://github.com/makerbase-mks/VESC-MKS
3. Makerbase VESC 75100 V2 Product Page
4. Makerbase VESC 75200 V2 Product Page
5. Makerbase VESC 84100HP User Manual
6. VESC Project Forums - Makerbase discussions
7. Community user reports and testing

**Last Updated**: 2025-05-05

**Trademark Notice**: "VESC" is a registered trademark of Benjamin Vedder. Makerbase produces VESC-compatible hardware under their MKSESC product line.

**Disclaimer**: This documentation is based on manufacturer specifications and community reports. Hardware revisions and firmware compatibility are critical - always verify your specific version. The phase filtering warning for 75100 V2 is critical to prevent damage.
