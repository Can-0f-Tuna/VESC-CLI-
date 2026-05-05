# BLDC Motor Database - Summary and Index

## Overview

This database contains comprehensive documentation on BLDC motors commonly used with VESC controllers across electric skateboard, e-bike, robotics, and EV applications.

---

## Database Contents

### Premium E-Skate Motors

| File | Brand | Models | Best For |
|------|-------|--------|----------|
| `maytech-6364-6374-6384.md` | Maytech | 6365, 6374, 6384, 63100 | Reliable performance builds |
| `flipsky-6354-6374-6384.md` | Flipsky | 6354, 6368, 6374, 6384, 63100 | Best value for money |
| `torqueboards-6374-6380.md` | TorqueBoards | 6355, 6374, 6380, Direct Drive | Premium builds |
| `bkb-build-kit-boards.md` | BKB | 6354, 6368, 6384 | BKB kit integration |
| `eovan-6374.md` | Eovan | 6374-170KV | Eovan systems |

### Budget and Entry-Level Motors

| File | Brand | Models | Best For |
|------|-------|--------|----------|
| `turnigy-sk3-sk8.md` | Turnigy | SK3 6374, SK8 6374 | Budget builds, RC conversion |
| `generic-5055-5065-6355.md` | Various | 5055, 5065, 6355 | Entry-level, learning |

### E-Bike and High-Power Motors

| File | Brand | Models | Best For |
|------|-------|--------|----------|
| `bafang-bbs02-bbshd.md` | Bafang | BBS02, BBSHD | Mid-drive e-bikes |
| `qs-motor-205-273.md` | QS Motor | QS205, QS273 | High-power e-moto, EVs |
| `mxus-3k-turbo.md` | MXUS | 3K Turbo V3 | Budget high-power builds |

### Specialty Motors

| File | Brand | Models | Best For |
|------|-------|--------|----------|
| `t-motor-antigravity.md` | T-Motor | MN2806, MN4004, MN4006, etc. | UAVs, lightweight robotics |

---

## Quick Selection Guide

### By Application

#### Electric Skateboard (Performance)
1. **TorqueBoards 6380** - Maximum power, premium quality
2. **Maytech 6384** - Reliable high-power
3. **Flipsky 6384** - Value high-power
4. **TorqueBoards 6374** - Premium standard
5. **Flipsky 6374** - Best value standard

#### Electric Skateboard (Budget)
1. **Flipsky 6354** - Best budget performance
2. **Turnigy SK3 6374** - DIY budget option
3. **Generic 6355** - Entry level
4. **Generic 5065** - Light riders, flat terrain

#### E-Bike (Hub Motor)
1. **QS205 50H V3Ti** - High power, VESC compatible
2. **MXUS 3K Turbo V3** - Best value high-power
3. **Generic 6374** - Budget mid-drive feeling

#### E-Bike (Mid-Drive)
1. **Bafang BBSHD** - Best overall (proprietary controller)
2. **Bafang BBS02** - Budget mid-drive
3. **QS205 with VESC** - Custom high-power

#### E-Motorcycle / High Power
1. **QS273 50H** - Extreme power
2. **QS205 50H** - Street performance
3. **MXUS 3K 5T** - Torque for hills

#### Robotics / UAV
1. **T-Motor Antigravity** - Lightweight, efficient
2. **Flipsky 5065** - Medium robotics
3. **Generic 5055** - Small robotics

---

## Motor Specifications Summary Table

### E-Skate Motors (63mm Class)

| Motor | kV Options | Power | Current | Weight | Price | Key Feature |
|-------|------------|-------|---------|--------|-------|-------------|
| Maytech 6374 | 170/190 | 3550W | 65A | 668-860g | $80-100 | Reliable, waterproof options |
| Flipsky 6374 | 140/170/190 | 3500W | 85A | 860-980g | $99-113 | Battle hardened, value |
| TorqueBoards 6374 | 170/190 | 3500W | 85A | 870g | $164 | Premium, CNC vents |
| TorqueBoards 6380 | 170/190 | 4580W | 95A | 1020g | $195 | Maximum power |
| Flipsky 6384 | 140/170/190 | 4000W | 95A | 1100g | $113-119 | High power value |
| BKB 6384 | 160/190 | 4000W | 100A | ~900g | $120-140 | RailCore compatible |
| Eovan 6374 | 170 | 3500W | - | ~900g | $129 | Integrated design |

### E-Bike Hub Motors (High Power)

| Motor | kV | Rated Power | Peak Power | Weight | Price | Best Use |
|-------|----|-------------|------------|--------|-------|----------|
| QS205 50H 3T | 11.9 | 3000W | 6000W+ | 14-16kg | $250-350 | Speed, street |
| QS205 50H 5T | 7.2 | 3000W | 6000W+ | 14-16kg | $250-350 | Torque, hills |
| QS273 40H | 6-8 | 3000-5000W | 10000W | 25kg | $400-500 | E-moto |
| QS273 50H | 6-8 | 5000-8000W | 20000W | 25kg | $500-700 | Extreme power |
| MXUS 3K 3T | 11.9 | 3000W | 8000W | ~10kg | $200-300 | Budget speed |
| MXUS 3K 5T | 7.2 | 3000W | 8000W | ~10kg | $200-300 | Budget torque |

---

## VESC Compatibility Matrix

### Plug-and-Play VESC Compatible
- ✅ All Flipsky motors
- ✅ All Maytech sensored motors
- ✅ All TorqueBoards motors
- ✅ All BKB motors
- ✅ QS205 and QS273 (with proper VESC)
- ✅ MXUS 3K Turbo
- ✅ Turnigy SK8 series

### Requires Adaptation
- ⚠️ Turnigy SK3 (sensorless only, no keyway)
- ⚠️ Generic motors (variable quality)
- ⚠️ Bafang (proprietary, VESC conversion complex)
- ⚠️ T-Motor (kV too high, shaft size different)
- ⚠️ Eovan (custom connector)

---

## Key VESC Controllers by Motor Class

### For 50-65mm Motors (E-Skate Budget)
- FSESC4.12 50A
- FSESC4.20 Mini
- Spintend uBox

### For 74-80mm Motors (E-Skate Standard)
- FSESC6.6 60A
- VESC 75/300 (overkill but good)
- Spintend 100V/100A

### For 80-100mm+ Motors (E-Skate High Power)
- VESC 75/300
- VESC 100/250
- Trampa VESC 100/250

### For Hub Motors (E-Bike)
- VESC 75/300 (QS205)
- VESC 100/250 (QS205)
- NextGen FOC 144V (QS273 high voltage)
- Spintend 100V/100A (MXUS 3K)

---

## Important Notes

### Data Quality
- All specifications sourced from official manufacturer documentation where available
- Community-verified data included with attribution
- Some values are typical/estimated based on comparable motors
- kV tolerances typically ±5-10%

### Safety Warnings
⚠️ **Always use torque arms with hub motors**  
⚠️ **Monitor motor temperature - magnets can demagnetize**  
⚠️ **Verify voltage ratings before high-voltage operation**  
⚠️ **Hall sensor wiring varies - verify pinout before connection**  
⚠️ **Budget motors should be battle hardened before high-power use**

### Maintenance
- Check set screws regularly
- Clean motors periodically
- Monitor bearing noise
- Use threadlocker on critical fasteners
- Balance wheels/motors periodically

---

## Glossary

| Term | Definition |
|------|------------|
| **kV** | RPM per volt (motor speed constant) |
| **Outrunner** | Motor where outer can rotates |
| **Sensored** | Has Hall effect sensors for position |
| **Sensorless** | No position sensors, uses BEMF |
| **FOC** | Field Oriented Control (efficient algorithm) |
| **BLDC** | Brushless DC motor |
| **Battle Hardening** | Epoxying magnets to prevent loosening |
| **63xx** | Motor size: 63mm diameter, xx mm length |
| **12S** | 12 LiPo cells in series (~50.4V max) |
| **ERPM** | Electrical RPM (RPM × pole pairs) |
| **Phase Current** | Current in motor windings |
| **Battery Current** | Current from battery |

---

## File Locations

All motor files are located in:
```
vesc-cli-skill/information/motors/
```

**Files Created:**
1. `maytech-6364-6374-6384.md`
2. `flipsky-6354-6374-6384.md`
3. `torqueboards-6374-6380.md`
4. `bkb-build-kit-boards.md`
5. `turnigy-sk3-sk8.md`
6. `t-motor-antigravity.md`
7. `bafang-bbs02-bbshd.md`
8. `qs-motor-205-273.md`
9. `mxus-3k-turbo.md`
10. `generic-5055-5065-6355.md`
11. `eovan-6374.md`
12. `motor-database-index.md` (this file)

**Total Motors Documented:** 50+ individual motor variants across 11 files

---

## Updates and Contributions

This database should be updated when:
- New motor models are released
- New community test data becomes available
- Errors or omissions are discovered
- VESC compatibility information changes

**Version:** 1.0  
**Last Updated:** May 2026  
**Maintainer:** VESC CLI Project

---

## Resources

### Official Sources
- VESC Project: https://vesc-project.com
- Benjamin Vedder's Blog: https://vedder.se

### Communities
- ESK8 Forum: https://www.electric-skateboard.builders
- Endless Sphere: https://endless-sphere.com
- Reddit r/ElectricSkateboard
- Reddit r/ebikes

### Tools
- VESC Tool: Motor configuration software
- ESK8 Calculator: Speed/range estimation
- Motor Comparison Tools

---

*This database is part of the VESC CLI (veac) project for comprehensive motor documentation.*
