# VESC Controllers - Summary Index

**Last Updated**: 2025-05-05

## Complete File List

This directory contains **13 comprehensive controller documentation files**:

### Official VESC Hardware (7 files)
1. **vesc-4-12.md** - Original VESC 4.12 (2015) - 60V, 50A, Two-shunt design
2. **vesc-6.md** - VESC 6 platform (MKIII-MKVI, HP variants) - 60V-75V, 80-100A, Three-shunt design
3. **vesc-express.md** - Wi-Fi/Bluetooth connectivity module (not a motor controller)
4. **vesc-hd60-hd75.md** - High-power VESC 6 variants - 60V/75V, high current
5. **vesc-100-250.md** - Ultra-high voltage controller - 100V, 250A, 22S capable
6. **vesc-75-300.md** - Ultra-high current controller - 75V, 300A, phase-shunt design
7. **vesc-labs-2025.md** - 2025+ VESC Labs product lineup (Minim, Duet, Classic, Maxim series)

### Third-Party VESC-Compatible Controllers (6 files)
8. **flipsky-fsesc-4-12.md** - Flipsky FSESC 4.12 - Budget VESC 4.12 clone
9. **flipsky-fsesc-6-6-6-7.md** - Flipsky FSESC 6.6/6.7 PRO - VESC 6 based, affordable
10. **makerbase-vesc.md** - Makerbase MKSESC 75100/75200 - Aluminum PCB, 84V, high current
11. **spintend-ubox.md** - Spintend Ubox series - Integrated IMU, power button, LED indicators
12. **torqueboards-torque6.md** - Torqueboards TORQUE6 - Skateboard-optimized VESC 6
13. **cheap-focer.md** - Cheap FOCer v1/v2/v3 - Open-source DIY VESC project

## Controller Categories by Use Case

### Entry-Level / Budget (Under $100)
- Flipsky FSESC 4.12 ($60-80) - VESC 4.12 based
- Spintend Ubox 100V 100A ($85-145) - Budget high-voltage
- Makerbase 75100 ($90) - 100A, 84V, aluminum PCB

### Mid-Range / Performance ($100-200)
- Flipsky FSESC 6.7 PRO ($140) - 60A, VESC 6 based
- Torqueboards TORQUE6 ($135) - 80A, skateboard optimized
- Spintend Ubox 85V 150A ($130-155) - Popular daily driver
- VESC Minim (€159.99) - Official compact 100V
- VESC Classic 100V (€199.99) - Official 160A
- VESC Duet XS (€199.99) - Official dual motor

### High-Performance / High Voltage ($200-400)
- Makerbase 75200 ($120-130) - 200A, 84V, aluminum PCB
- Spintend Ubox 85V 250A ($170-215) - 250A high power
- Torqueboards TORQUE6 Dual ($270-342) - Dual motor
- VESC 4.12 (original, historical pricing) - Legacy reference
- VESC 6 MKVI ($200+) - Official 80-100A
- VESC Duet (€399.99) - Official dual with Wi-Fi
- VESC Classic+ 100V (€299.99) - Official 300A
- VESC Pronto (€329.99) - Official waterproof

### Extreme Performance / Professional ($400+)
- VESC 75/300 ($300-400) - Official 300A
- VESC 100/250 ($300-400) - Official 100V, 250A
- VESC Maxim 120V (€649.99) - Official 400A, 26S
- VESC Maxim 150V (€729.99) - Official 150V, 32S
- VESC Maxim+ 120V (€849.99) - Official 660A, 50kW
- VESC Maxim+ 150V (€949.99) - Official 420A, 50kW, 32S

### Special Purpose
- **VESC Express** (~$50-80) - Logging/connectivity module
- **Cheap FOCer v3** ($100-150) - Open-source DIY
- **Spintend Ubox 126V** ($199) - 30S capable

## Voltage Capabilities Summary

| Voltage | 12S (50V) | 16S (67V) | 20S (84V) | 22S (92V) | 26S (109V) | 32S (134V) |
|---------|-----------|-----------|-----------|-----------|------------|------------|
| **Controllers** | Most 60V units | VESC 6/75, 75/300 | Makerbase, Ubox | VESC 100/250, Labs 100V | VESC Maxim 120V | VESC Maxim 150V |

## Current Capabilities Summary

| Current | 50A | 60-80A | 100-150A | 200-250A | 300A | 400A+ |
|---------|-----|--------|----------|----------|------|-------|
| **Controllers** | VESC 4.12, Flipsky 4.12 | Flipsky 6.x, TORQUE6 | VESC 6, Ubox 150A, Makerbase 75100 | Makerbase 75200, Ubox 250A, VESC 100/250 | VESC 75/300, Classic+ | VESC Maxim series |

## ERPM Capabilities

| ERPM Limit | 60,000 | 150,000 |
|------------|--------|---------|
| **Hardware** | VESC 4.12 based | VESC 6 based |
| **Controllers** | All 4.12 clones, Cheap FOCer v1 | All VESC 6, modern clones |

## Key Features Comparison

### Three-Shunt vs Two-Shunt
- **Two-shunt**: VESC 4.12, Flipsky 4.12, Cheap FOCer v1
- **Three-shunt**: VESC 6, Flipsky 6.x, TORQUE6, Makerbase, Ubox, VESC Labs

### IMU (Balancing Applications)
- **Integrated**: Spintend Ubox (most), Flipsky 6.x (select), Cheap FOCer v3, VESC Labs
- **Optional/Add-on**: VESC 6 MKVI (select versions)

### Waterproof/Potted
- **Yes**: VESC Pronto, VESC Maxim series (all potted)
- **No/Case dependent**: Most other controllers

### Built-in Wi-Fi/Bluetooth
- **Yes**: VESC Express (standalone), VESC Duet, VESC Pronto, VESC Maxim series
- **No (requires module)**: Most other controllers

### Aluminum PCB (Enhanced Cooling)
- **Yes**: Makerbase series, Spintend Ubox Aluminum series, Cheap FOCer v3
- **No**: Most other controllers (use aluminum case instead)

## Data Quality

### Sources Used
- Benjamin Vedder's official VESC website (vedder.se)
- VESC Project official documentation (vesc-project.com)
- VESC Labs official specifications (vesclabs.com)
- Trampa Boards product pages (trampa.co.uk, trampaboards.com)
- Flipsky official specifications (flipsky.net)
- Makerbase3D product pages (makerbase3d.com)
- Spintend official documentation (spintend.com)
- DIY Electric Skateboard (torqueboards) specs
- Cheap FOCer GitHub repository (shamansystems)
- Community forums and verified user reports

### Verification Level
- **High**: Official VESC products (Benjamin Vedder designs)
- **High**: Direct manufacturer specifications
- **Medium-High**: Community-tested third-party products
- **Medium**: Discontinued/legacy products

### Last Verified
All specifications verified as of **May 5, 2025**.

## Important Notes

### Firmware Compatibility
All controllers documented here are compatible with official VESC Tool software available at https://vesc-project.com/vesc_tool

### Trademark Status
- **"VESC" trademark**: Owned by Benjamin Vedder
- **Official manufacturers**: VESC Labs (2025+), Trampa Boards (legacy)
- **Third-party naming**: FSESC, MKSESC, Ubox, TORQUE6, Cheap FOCer

### Safety Warnings
- All VESC controllers handle lethal voltages and currents
- Proper safety systems (fuses, BMS, precharge) required
- Thermal management essential for rated performance
- High voltage builds (20S+) require expert knowledge

## Recommended First Controller

For users new to VESC:
1. **Budget**: Flipsky FSESC 6.7 PRO or Spintend Ubox 85V 150A
2. **Official**: VESC Classic 100V or VESC Minim
3. **Learning**: Cheap FOCer v3 (pre-built)

## Recommended Advanced Controller

For experienced builders:
1. **High Voltage**: VESC Maxim 120V/150V or Spintend Ubox 126V
2. **High Current**: VESC Maxim+ series or VESC 75/300
3. **Dual Motor**: VESC Duet or Dual Ubox
4. **Marine**: VESC Pronto (potted)

---

**Total Controllers Documented**: 13 distinct products (covering 30+ individual models/variants)

**Documentation Status**: Complete and verified as of 2025-05-05

**Maintainer**: veac CLI project
