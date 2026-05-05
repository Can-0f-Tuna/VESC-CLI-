# Bafang BBS02 and BBSHD Mid-Drive Motors

## Overview

Bafang is one of the world's largest manufacturers of e-bike drive systems. Their BBS (Bafang Brushless System) series of mid-drive motors are among the most popular conversion kits globally. While Bafang motors typically use proprietary controllers, they are increasingly being adapted for VESC use by enthusiasts seeking advanced control features like FOC, field weakening, and custom throttle curves.

**Manufacturer:** Bafang Electric (Suzhou) Co., Ltd. (China)  
**Official Website:** https://bafang-e.com  
**Primary Applications:** Electric bicycles, e-mtb, cargo bikes, fat bikes

---

## Available Variants

### BBS01 Series (Entry Level)
| Model | Voltage | Power | Torque | Weight |
|-------|---------|-------|--------|--------|
| BBS01B 250W | 36V | 250W nominal | ~80Nm | 3.9kg |
| BBS01B 350W | 36V/48V | 350W nominal | ~80Nm | 3.9kg |

**Note:** Not recommended for VESC conversion (lower power, less common)

### BBS02 Series (Mid-Range)
| Model | Voltage | Power | Peak Power | Torque | Controller |
|-------|---------|-------|------------|--------|------------|
| BBS02B 500W | 36V/48V | 500W | ~983W | 100Nm | 9 FET (18A) |
| BBS02B 750W | 48V/52V | 750W | ~1470W | 120Nm | 9 FET (25A) |

**Versions:**
- **Version A (2014):** Poor quality MOSFETs, prone to overheating
- **Version B (2016+):** Upgraded IRFB3077 FETs, better reliability
- **Factory Settings:** Often conservative (500W may ship at 18A limit)

### BBSHD Series (High Performance)
| Model | Voltage | Power | Peak Power | Torque | Controller |
|-------|---------|-------|------------|--------|------------|
| BBSHD 1000W | 48V/52V | 1000W nominal | ~1764W | 160Nm | 12 FET (30A) |
| BBSHD 1000W (48V) | 48V | 1000W | ~1632W | 160Nm | 12 FET (30A) |
| BBSHD 1000W (52V) | 52V | 1000W | ~1764W | 160Nm | 12 FET (30A) |

**Key Differences from BBS02:**
- 66% larger stator
- External cooling fins
- 12 FET controller vs 9 FET
- 30A continuous vs 25A
- 160Nm vs 120Nm torque
- ~1kg heavier

---

## Common Specifications

| Parameter | BBS02 750W | BBSHD 1000W |
|-----------|------------|-------------|
| **Motor Type** | Mid-drive, Brushless, Geared | Mid-drive, Brushless, Geared |
| **Motor Position** | Bottom bracket (replaces crankset) | Bottom bracket |
| **Voltage** | 36V, 48V, 52V | 48V, 52V |
| **Nominal Power** | 500W or 750W | 1000W |
| **Peak Power** | 983W-1470W | 1632W-1764W |
| **Rated Current** | 18A (500W) / 25A (750W) | 30A |
| **Max Torque** | 100-120Nm | 160Nm |
| **RPM (no load)** | ~120 RPM | 130-150 RPM |
| **Reduction Ratio** | 1:21.9 | 1:21.9 |
| **Weight** | 4.3kg | ~6kg |
| **Bottom Bracket** | 68mm/73mm/100mm | 68mm/100mm/120mm |
| **Controller** | Integrated | Integrated |
| **PAS Sensor** | Speed sensor | Speed sensor |
| **IP Rating** | IP65 | IP65 |
| **Efficiency** | ≥80% | ≥80% |
| **Chainring** | 44T/46T/48T/52T options | 44T/46T/48T/52T |

---

## Controller Specifications

### BBS02 Controller
| Parameter | Value |
|-----------|-------|
| MOSFETs | 9 (Version B: IRFB3077) |
| Max Current | 25A |
| Voltage Range | 36V-52V |
| Programmable | Yes (with cable/software) |
| Thermal Management | Moderate (can overheat) |

### BBSHD Controller
| Parameter | Value |
|-----------|-------|
| MOSFETs | 12 (IRFB3077) |
| Max Current | 30A (stock) |
| Max Voltage | ~60V (brief headroom above 52V) |
| Programmable | Yes |
| Cooling | External fins + internal heatsink |
| Reliability | Good for sustained high power |

---

## VESC Compatibility and Conversion

### Using Bafang with VESC

The Bafang BBS motors are mechanically excellent but come with proprietary controllers. Some enthusiasts replace the stock controller with VESC for:
- FOC motor control
- Custom throttle curves
- Better efficiency
- Field weakening
- Data logging
- Open-source flexibility

### Conversion Approaches

#### Option 1: External VESC (Stock Motor)
- Keep Bafang motor and gears
- Remove/disconnect stock controller
- Install external VESC in custom enclosure
- Wire motor phases to VESC
- Add external PAS/torque sensor
- **Challenge:** Bafang has integrated controller; complete disassembly required

#### Option 2: Motor Extraction
- Remove motor from Bafang housing
- Use just the BLDC motor (loses gearing)
- Mount separately with chain/belt drive
- **Challenge:** Requires significant fabrication

#### Option 3: Controller Bypass
- Some have hacked stock controller
- Send VESC signals to motor
- **Status:** Complex, not recommended

### Technical Challenges

1. **Integrated Design:** Motor and controller are one unit
2. **Gearbox Integration:** Motor is designed for specific reduction ratio
3. **Sensor Compatibility:** Bafang PAS is proprietary
4. **Thermal:** Stock cooling designed for stock controller
5. **Warranty:** Voided by modification

### Community Solutions
- Endless Sphere forum has threads on Bafang VESC conversion
- Some have succeeded with BBSHD + external VESC
- Requires 3D printed controller housings
- Custom wiring harnesses needed

---

## Stock Controller Programming

### Without VESC (Stock System)
Bafang motors can be significantly improved by programming the stock controller:

#### Adjustable Parameters
- Current limit (up to hardware max)
- PAS levels and response
- Throttle response
- Speed limit
- Walk mode speed

#### Programming Tools
- **Bafang Programming Cable:** USB to Higo connector
- **Software:** Penoff's Hobby Programming or open-source alternatives
- **Mobile:** Some Bluetooth dongles available

#### Recommended Settings (750W BBS02)
```
Current Limit: 25A (max hardware)
Speed Limit: 45-50 km/h (based on wheel size)
PAS Levels: Customizable 1-9
Throttle: Disabled or enabled based on regulations
```

#### Safety Limits
- **52V on BBS02:** Marginal - max voltage ~60V, fully charged 52V = 58.8V
- **Recommendation:** Limit to 48V or reduce current to 18-20A with 52V
- **BBSHD:** Native 52V support

---

## Performance Characteristics

### Power Delivery
| Configuration | Continuous | Peak | Use Case |
|---------------|------------|------|----------|
| BBS02 500W (stock) | 500W | 800W | Legal compliance |
| BBS02 750W (stock) | 750W | 1365W | Balanced performance |
| BBS02 750W (maxed) | 1000W+ | 1470W | Aggressive tuning |
| BBSHD (stock) | 1000W | 1500W | Strong performance |
| BBSHD (52V max) | 1200W | 1764W | Maximum stock |

### Hill Climbing
| Grade | BBS02 750W | BBSHD |
|-------|------------|-------|
| 10% | Easy | Very Easy |
| 20% | Moderate effort | Easy |
| 30% | Hard, may overheat | Moderate |

### Speed (Typical 26" Wheel, 48V)
| Setup | Top Speed |
|-------|-----------|
| BBS02 750W | 45-50 km/h |
| BBSHD 1000W | 55-60 km/h |
| BBSHD + field weakening (VESC) | 70+ km/h (if converted) |

---

## Recommended Configurations

### Commuter E-Bike (BBS02 750W)
| Component | Specification |
|-----------|-------------|
| Motor | BBS02B 750W 48V |
| Battery | 48V 14Ah (Samsung/Panasonic cells) |
| Display | DPC18 or 750C |
| Chainring | 46T (balanced) |
| Cassette | 11-34T |
| Range | 40-60 km |
| Top Speed | 45 km/h |
| Best For | Commuting, moderate hills |

### Performance E-MTB (BBSHD)
| Component | Specification |
|-----------|-------------|
| Motor | BBSHD 1000W 52V |
| Battery | 52V 20Ah high-drain |
| Display | 860C or DPC18 |
| Chainring | 42T (Lekkie or similar) |
| Cassette | 11-42T or 11-50T |
| Brakes | Hydraulic 4-piston |
| Range | 30-50 km (aggressive) |
| Top Speed | 60 km/h |
| Best For | Off-road, steep hills, heavy loads |

### VESC Conversion Project (Advanced)
| Component | Specification |
|-----------|-------------|
| Motor | BBSHD (motor only extraction) |
| VESC | VESC 75/300 or similar high-power |
| Battery | 72V custom (within motor insulation limits) |
| Sensors | External torque + PAS |
| Cooling | Enhanced (motor may need it) |
| Note | Experimental, not plug-and-play |

---

## VESC Configuration (If Converted)

### BBSHD Motor Constants (Estimated)
```
Motor Type: FOC
Pole Pairs: ~8-10 (exact count varies)

Current Limits:
  Motor Max: 50A (thermal limited)
  Battery Max: 30A (stock controller limit)
  
Voltage:
  Nominal: 48-52V
  Max: 58.8V (14S max - verify motor insulation)
  
Note: These are estimates; actual values require measurement
```

### Warnings
⚠️ **Motor Insulation:** Bafang motors rated for ~60V; higher voltage risks insulation damage  
⚠️ **Gearbox Limits:** Nylon gears have torque limits; excessive current can strip  
⚠️ **Thermal:** Mid-drive motors rely on airflow; sustained high power requires monitoring  
⚠️ **Warranty:** Any modification voids warranty  

---

## Where to Buy

### Official/Authorized
- **Luna Cycle (US):** https://lunacycle.com (popular BBSHD source)
- **Bafang Official:** https://bafang-e.com
- **EM3EV:** https://em3ev.com
- **AliExpress:** Various sellers (verify authenticity)

### Pricing (USD, approximate)
| Product | Price |
|---------|-------|
| BBS02B 750W Kit | $400-500 |
| BBSHD 1000W Kit | $600-700 |
| BBSHD with 52V Battery | $900-1200 |
| Programming Cable | $15-25 |

---

## Comparison: BBS02 vs BBSHD

| Feature | BBS02 750W | BBSHD 1000W |
|---------|------------|-------------|
| Price | ~$400 | ~$650 |
| Weight | 4.3kg | ~6kg |
| Power | 750W nominal | 1000W nominal |
| Peak | ~1470W | ~1764W |
| Torque | 120Nm | 160Nm |
| Heat | Can overheat | Better cooling |
| Best For | Commuting | Off-road, heavy |
| VESC Worthy? | Marginal | Better candidate |

---

## Known Issues

### BBS02 Controller Failures
- **Cause:** Overheating, poor FETs (early versions)
- **Solution:** Version B has better FETs; avoid sustained max current
- **Prevention:** Monitor temp, use 48V rather than 52V

### BBSHD Reliability
- Generally reliable if not abused
- Controller can handle more than motor thermally can
- Gearbox is weak point under extreme torque

### Gearbox Wear
- **Cause:** High torque, shifting under power
- **Symptoms:** Grinding, play in gears
- **Solution:** Reduce current, shift gently

---

## Sources

### Official
- Bafang Official: https://bafang-e.com
- BBSHD Dealer Manual: https://cdn.shopify.com/s/files/1/0592/1289/0296/files/Bafang_BBSHD_Dealer_Manual.pdf

### Community
- Endless Sphere Bafang Forum: https://endless-sphere.com/sphere/forums/bafang-mid-drive.43/
- Ebike Choices Comparison: https://www.ebikechoices.com/bafang-bbs02-vs-bbshd/
- Voltriderz Comparison: https://www.voltriderz.com/bafang-bbs02b-vs-bbshd-comparison/

### Programming
- Penoff's Hobby Software (for programming cable)
- Bafang Configuration Guides

---

*Last Updated: May 2026*

**Disclaimer:** VESC conversion of Bafang motors is experimental and requires advanced technical knowledge. Stock controllers are well-engineered for the motor's design. Conversion risks include motor damage, safety hazards, and voided warranty.
