# VESC Controllers Database

This directory contains comprehensive documentation for VESC (Vedder Electronic Speed Controller) compatible motor controllers.

## What is VESC?

**VESC** stands for **Vedder Electronic Speed Controller**, an open-source motor control platform created by Benjamin Vedder. It has become the de facto standard for high-performance brushless motor control in electric vehicles, robotics, and industrial applications.

## Files in This Directory

### Official VESC Hardware

| File | Controller | Description |
|------|------------|-------------|
| `vesc-4-12.md` | VESC 4.12 | Original open-source VESC hardware (2015) |
| `vesc-6.md` | VESC 6 | Second-generation VESC with three-shunt design |
| `vesc-express.md` | VESC Express | Wi-Fi/Bluetooth logging and connectivity module |
| `vesc-hd60-hd75.md` | VESC HD60/HD75 | High-power VESC 6 variants |
| `vesc-100-250.md` | VESC 100/250 | Ultra-high voltage (100V) controller |
| `vesc-75-300.md` | VESC 75/300 | Ultra-high current (300A) controller |
| `vesc-labs-2025.md` | VESC Labs 2025+ | Current official VESC Labs product lineup |

### Third-Party VESC-Compatible Controllers

| File | Manufacturer | Description |
|------|--------------|-------------|
| `flipsky-fsesc-4-12.md` | Flipsky | Budget VESC 4.12 clone |
| `flipsky-fsesc-6-6-6-7.md` | Flipsky | VESC 6-based controllers (6.6, 6.7 PRO) |
| `makerbase-vesc.md` | Makerbase | Aluminum PCB VESC controllers (75100, 75200) |
| `spintend-ubox.md` | Spintend | Ubox series with integrated features |
| `torqueboards-torque6.md` | Torqueboards | Skateboard-optimized VESC 6 |
| `cheap-focer.md` | shamansystems/Makers PEV | Open-source DIY VESC project |

## Quick Selection Guide

### By Application

**Electric Skateboard (Entry Level)**
- Flipsky FSESC 4.12 (~$60-80)
- Cheap FOCer v3 (~$100-150)
- VESC Minim (€159.99)

**Electric Skateboard (Performance)**
- Flipsky FSESC 6.7 PRO (~$140)
- Torqueboards TORQUE6 (~$135)
- VESC Classic 100V (€199.99)
- VESC Duet XS 100V (€199.99)

**E-Foil / Marine**
- Makerbase 75200 (~$120)
- Spintend Ubox 85V 250A (~$170)
- VESC Pronto (€329.99) - Potted/waterproof
- VESC Maxim 120V (€649.99)

**High Voltage (20S+)**
- Spintend Ubox 100V 100A (~$85-145)
- Makerbase 75100/75200 (84V, 20S)
- VESC 100/250 (~£300-400)
- VESC Maxim 150V (€729.99) - Up to 32S

**High Current (200A+)**
- Makerbase 75200 (200A)
- Spintend Ubox 85V 250A (250A)
- VESC 75/300 (300A)
- VESC Classic+ 100V (300A)
- VESC Maxim+ 120V (660A!)

**Balancing Applications (One-Wheel, Unicycle)**
- Spintend Ubox (integrated BMI160 IMU)
- Flipsky FSESC 6.6/6.7 (IMU versions)
- Any VESC 6 with BMI160 IMU

**Budget Builds**
- Flipsky FSESC 4.12 ($60-80)
- Cheap FOCer v3 ($100-150)
- Spintend Ubox 100V 100A ($85)
- Makerbase 75100 ($90)

**Premium/Official**
- VESC Labs products (€159.99 - €949.99)
- Legacy Trampa VESC 6/75/300/100/250

### By Voltage

| Max Voltage | Controllers |
|-------------|-------------|
| 60V (12S) | VESC 4.12, VESC 6 MKVI, Flipsky 4.12/6.x, TORQUE6 |
| 75V (16S) | VESC 6/75, VESC 75/300 |
| 84V (20S) | Makerbase 75100/75200 |
| 85V | Spintend Ubox 85V series |
| 100V (22S) | VESC 100/250, Spintend Ubox 100V, VESC Labs 100V series |
| 126V (30S) | Spintend Ubox 126V |
| 150V (32S) | VESC Maxim 150V |

### By Current

| Continuous Current | Controllers |
|-------------------|-------------|
| 50A | VESC 4.12, Flipsky 4.12 |
| 60-80A | Flipsky 6.6/6.7, TORQUE6 |
| 100A | VESC 6 MKVI, Makerbase 75100, Spintend Ubox 100V 100A |
| 150A | VESC 6 MKVI HP, Spintend Ubox 85V 150A |
| 200A | Makerbase 75200, TORQUE6 Dual |
| 250A | VESC 100/250, Spintend Ubox 85V 250A |
| 300A | VESC 75/300, VESC Classic+ 100V |
| 400A+ | VESC Maxim series |

## Important Considerations

### Firmware Compatibility
- All controllers in this database are compatible with **VESC Tool**
- Official firmware available at: https://vesc-project.com/vesc_tool
- Some third-party controllers recommend specific firmware versions
- Always check firmware compatibility before updating

### Voltage Spikes
- **Critical**: Voltage spikes must not exceed rated maximum
- Battery voltage at full charge + regen can exceed nominal
- Example: 12S (50.4V) + regen spikes can approach 60V
- Use appropriate safety margins

### Thermal Management
- All VESC controllers require proper cooling for rated current
- Aluminum cases/heatsinks significantly improve performance
- Continuous high current requires active cooling or large heatsinks
- Temperature monitoring via VESC Tool recommended

### Safety Warnings
- High voltage and current can be lethal
- Proper fusing and safety systems required
- Battery BMS must match controller capabilities
- Precharge circuits recommended for large capacitors

## Trademark Notice

**"VESC"** is a registered trademark of Benjamin Vedder. Only products from **VESC Labs** (2025+) and legacy **Trampa Boards** are authorized to use the VESC trademark. Third-party compatible products use alternative names (FSESC, MKSESC, Ubox, TORQUE6, Cheap FOCer, etc.) while maintaining software compatibility.

## Official Resources

- **VESC Labs**: https://www.vesclabs.com/ (Official manufacturer, 2025+)
- **VESC Project**: https://vesc-project.com/ (Software, forums, documentation)
- **Benjamin Vedder GitHub**: https://github.com/vedderb (Open source firmware)
- **VESC Tool**: https://vesc-project.com/vesc_tool (Configuration software)

## Contributing

To add or update controller information:
1. Verify specifications from official manufacturer sources
2. Include last-updated date
3. Note any discrepancies between sources
4. Flag unverified information clearly

## License and Disclaimer

This database is for informational purposes only. Always verify specifications with the manufacturer before purchase or use. The VESC project and associated trademarks are property of Benjamin Vedder. Individual controller trademarks belong to their respective manufacturers.

**Last Updated**: 2025-05-05
