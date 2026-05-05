# MXUS 3K Turbo Hub Motors

## Overview

MXUS is a well-established manufacturer of electric bike hub motors, known for their "3K Turbo" series that offers high power density at competitive prices. The MXUS 3K Turbo (also called V3 or DDR-3K) has become a popular choice for high-speed e-bike builds and is frequently compared to the QS205 as a budget-friendly alternative. The motor offers impressive performance for its price point and has good compatibility with VESC controllers.

**Manufacturer:** MXUS (Zhejiang, China)  
**Official Website:** https://www.mxus.com (limited)  
**Primary Applications:** High-speed e-bikes, electric mopeds, e-motorcycles

---

## Available Variants

### MXUS 3K Turbo V3 (DDR-3K)
| Model | Turns | kV | Rated Power | Peak Power | Max Torque | Weight |
|-------|-------|----|-------------|------------|------------|--------|
| 3K-Turbo 3T | 3 turns | ~11.9 | 3000W | 8000W+ | 120Nm | ~10kg |
| 3K-Turbo 4T | 4 turns | ~8.9 | 3000W | 8000W+ | 140Nm+ | ~10kg |
| 3K-Turbo 5T | 5 turns | ~7.2 | 3000W | 8000W+ | 160Nm+ | ~10kg |

**Key Specifications:**
- Motor Type: Brushless DC Hub Motor (Direct Drive, Gearless)
- Construction: Single-sided axle (rear hub)
- Rim Compatibility: 20" - 28" bicycle rims, 16-19" moped rims
- Magnet Type: 45H Rare Earth (45mm wide magnets)
- Stator: Aluminum winding core
- Rated Voltage: 48V/60V/72V (48V-96V usable range)
- Rated Power: 1500W-3000W (nominal)
- Peak Power: 8000W (brief)
- Max Speed: 60-90 km/h (varies by voltage and winding)
- No-load RPM: 560 RPM @ 48V, 840 RPM @ 72V (3T winding)
- Max Torque: 120Nm (nominal), higher with lower kV
- Continuous Current: 45A
- Max Current: 80A (100A+ peak)
- Max Efficiency: >83%
- Brake Type: Disc brake compatible
- Dropout Width: 135mm (single speed), 142mm (7-speed freewheel)
- Axle: M14 or M16 (varies by batch/version)
- Phase Wire: 4mm² (4 gauge) silicone
- Hall Sensors: Dual sets (redundant), 120° phasing
- Temperature Sensor: Yes (varies by version)
- Waterproof: IP54
- Noise: <55dB
- Weight: 9.8-10.2kg
- Color: Black (standard)

### MXUS V3 Versions
| Version | Axle | Notes |
|---------|------|-------|
| V2 | 14mm | Older version |
| V3 | 16mm | Current production, stronger axle |
| V3Ti | 16mm | Thread-integrated (improved wire routing) |

**Note:** There has been confusion about axle sizes. According to MXUS:
- 142mm dropout width motors typically use 14mm axle
- 135mm dropout width motors typically use 16mm axle

---

## Common Specifications

| Parameter | MXUS 3K Turbo V3 |
|-----------|------------------|
| **Motor Type** | BLDC Hub, Direct Drive |
| **Pole Configuration** | 23 poles (46 magnets) |
| **Magnet Grade** | 45H (150°C rated) |
| **Magnet Width** | 45mm |
| **Stator Core** | Aluminum |
| **Rated Voltage** | 48V/60V/72V |
| **Voltage Range** | 36V-96V (extended) |
| **Rated Power** | 3000W |
| **Peak Power** | 8000W+ (brief) |
| **Continuous Current** | 45A |
| **Max Current** | 80A (sustained), 100A+ (peak) |
| **Efficiency** | >83% (up to 90% peak) |
| **Max RPM** | 1000+ RPM |
| **Max Speed** | 90-100 km/h (with 3T, 72V) |
| **Torque** | 120-160Nm (winding dependent) |
| **Dropout** | 135mm (single), 142mm (7-speed) |
| **Axle** | M14 or M16 (varies) |
| **Brake** | Disc (160-203mm compatible) |
| **Freewheel** | Single speed (135mm) or 7-speed (142mm) |
| **Phase Wire** | 4mm² (4 gauge) |
| **Hall Sensors** | Dual sets, 120° |
| **Temp Sensor** | Varies by production batch |
| **Waterproof** | IP54 |
| **Operating Temp** | -20°C to +100°C |
| **Weight** | ~10kg |

---

## Windings and Speed Options

### 3T Winding (Fast)
| Voltage | No-Load RPM | Typical Speed | Best For |
|---------|-------------|---------------|----------|
| 48V | 560 RPM | 60-70 km/h | Speed on 48V |
| 60V | 700 RPM | 70-80 km/h | Balanced speed |
| 72V | 840 RPM | 80-90 km/h | High speed |
| 84V | 980 RPM | 90-100 km/h | Extreme speed |
| 96V | 1120 RPM | 100+ km/h | Maximum speed |

### 4T Winding (Balanced)
| Voltage | No-Load RPM | Typical Speed | Best For |
|---------|-------------|---------------|----------|
| 48V | 430 RPM | 50-60 km/h | 48V efficiency |
| 60V | 535 RPM | 60-70 km/h | Balanced |
| 72V | 645 RPM | 70-80 km/h | Good speed |

### 5T Winding (Torque)
| Voltage | No-Load RPM | Typical Speed | Best For |
|---------|-------------|---------------|----------|
| 48V | 350 RPM | 40-50 km/h | Hills, cargo |
| 60V | 435 RPM | 50-60 km/h | Torque focus |
| 72V | 525 RPM | 60-70 km/h | Heavy riders |

**Note:** Actual speeds depend on wheel size, tire, and load.

---

## VESC Compatibility

### Why MXUS 3K Works Well with VESC
1. **Dual Hall Sensors:** Redundant, reliable startup
2. **High Power Capability:** Can utilize VESC current limits
3. **Temperature Monitoring:** Compatible sensors in many units
4. **Robust Construction:** Handles high phase current
5. **Popular:** Good community knowledge base

### Recommended VESC Controllers

#### Budget Options
| VESC | Battery A | Phase A | Notes |
|------|-----------|---------|-------|
| FSESC6.6 60A | 60A | 100A | Minimum viable |
| Spintend 100V 100A | 100A | 200A | Good match |
| Flipsky 100V 100A | 100A | 200A | Budget option |

#### Performance Options
| VESC | Battery A | Phase A | Notes |
|------|-----------|---------|-------|
| VESC 75/300 | 150A | 300A | Excellent match |
| VESC 100/250 | 100A | 250A | Good for 3T |
| Trampa VESC 100/250 | 100A | 250A | High quality |

### VESC Configuration (3T Winding, 72V)
```
Motor Type: FOC
Pole Pairs: 23/2 = 11.5 (round to 12 or use 23 with "Pole Pairs" = 11.5 setting)
Note: Some VESC firmwares don't support half pole pairs

Current Limits:
  Motor Max: 100A (thermal limited)
  Motor Min: -100A (regen)
  Battery Max: 60A (conservative) or 80A (aggressive)
  Battery Min: -20A (regen limit)

Voltage:
  Min: 36V
  Max: 86V (20S, fully charged)
  
Sensorless:
  ERPM Sensorless: 1500-2000
  
Hall Sensors:
  Mode: Sensored startup, sensorless run
  Transition ERPM: 2500
  
Temperature:
  Cutoff Start: 100°C
  Cutoff End: 120°C
  
Field Weakening:
  Enable: Optional (for extra 10-20% speed)
  Current: 20-30A
```

### Motor Detection (Typical Values)
| Parameter | 3T Winding | 4T Winding | 5T Winding |
|-----------|------------|------------|------------|
| R (mΩ) | 40-50 | 60-80 | 80-100 |
| L (μH) | 120-150 | 180-220 | 250-300 |
| λ (Wb) | ~0.008 | ~0.010 | ~0.012 |
| kV | 11.9 | 8.9 | 7.2 |
| Hall Table | [Varies] | [Varies] | [Varies] |

---

## Performance Characteristics

### Power Delivery
The MXUS 3K Turbo is known for handling far more than its 3000W rating:

| Duration | Safe Power | Notes |
|----------|------------|-------|
| Continuous | 3000W | Thermal equilibrium |
| 5 minutes | 5000W | Monitor temps |
| 30 seconds | 8000W | Brief acceleration |
| Instant | 10000W+ | Launch only |

### Heat Management
- **Challenge:** 10kg mass takes time to heat up but also to cool down
- **Symptoms:** Thermal rollback, reduced acceleration
- **Solutions:**
  - HubSinks (highly recommended)
  - Statorade (ferrofluid)
  - Thermal compound in stator
  - Ventilated rim tape

### Efficiency
- **Peak:** ~90% at cruise
- **Typical:** 83-88%
- **High Load:** Drops to 75-80%

### Cogging
- 23 poles = noticeable cogging
- Hall sensors essential for smooth start
- Push-start possible with strong legs

---

## Recommended Configurations

### Budget High-Speed E-Bike (72V)
| Component | Specification |
|-----------|-------------|
| Motor | MXUS 3K Turbo 3T |
| VESC | Spintend 100V/100A or Flipsky equivalent |
| Battery | 72V 20Ah (20S 6P) |
| Wheel | 26" or 27.5" MTX rim |
| Controller Settings | 80A battery, 200A phase |
| Top Speed | 80-90 km/h |
| Range | 30-50 km |
| Cooling | HubSinks recommended |
| Best For | Speed on budget |

### Hill Climber (60V Torque)
| Component | Specification |
|-----------|-------------|
| Motor | MXUS 3K Turbo 5T |
| VESC | VESC 75/300 or similar |
| Battery | 60V 30Ah (16S 8P) |
| Wheel | 26" with fat tire |
| Controller | 100A battery, 300A phase |
| Top Speed | 60 km/h |
| Hill Grade | 25%+ capability |
| Best For | Cargo, hills, reliability |

### Moped Conversion (48V)
| Component | Specification |
|-----------|-------------|
| Motor | MXUS 3K Turbo 4T |
| VESC | FSESC6.6 or similar |
| Battery | 48V 40Ah (13S 10P) |
| Wheel | 17" or 19" moped rim |
| Top Speed | 60-70 km/h |
| Range | 60-80 km |
| Best For | Moped style, range |

---

## Where to Buy

### Official/Primary
- **MXUS Alibaba Store:** https://mxus.en.alibaba.com
- **Direct from MXUS:** Contact via Alibaba

### Distributors
- **Elecycles:** https://www.elecycles.com/mxus-3000w-motor-brushless-electric-bike-rear-hub-motor.html
- **MyElectricBikeMotor:** https://myelectricbikemotor.com
- **E-Bike Power UK:** https://ebikepoweruk.com
- **The Ebike Shop UK:** https://theebikeshop.co.uk
- **Various AliExpress Sellers**

### Kit Options
Many sellers offer complete kits:
- Motor laced in rim
- Controller (sine wave)
- Throttle
- Display
- Brake levers
- PAS sensor

### Pricing (USD, approximate)
| Product | Price |
|---------|-------|
| Motor Only | $180-250 |
| Laced in 26" Rim | $280-350 |
| Complete Kit (72V) | $500-700 |
| With Battery (72V 20Ah) | $900-1200 |

---

## MXUS vs QS205 Comparison

| Feature | MXUS 3K Turbo | QS205 50H |
|---------|---------------|-----------|
| Price | Lower | Higher |
| Weight | ~10kg | 14-16kg |
| Power | 3000W rated | 3000W rated |
| Peak | 8000W | 6000W+ |
| Magnets | 45mm 45H | 50mm SH |
| Build Quality | Good | Better |
| VESC Ready | Yes | Yes |
| Axle | M14/M16 | M16 (V3) |
| Halls | Dual | Dual |
| Temp Sensor | Varies | KTY83-122 |
| Waterproof | IP54 | IP54-IP66 |
| Value | Excellent | Good |

**Verdict:** MXUS is the budget king; QS205 is the premium option. Both work well with VESC.

---

## Known Issues and Solutions

### Issue: Axle Size Confusion
- **Problem:** V2 vs V3, 14mm vs 16mm uncertainty
- **Solution:** Confirm with seller before purchase
- **Note:** 142mm dropout usually = 14mm axle, 135mm = 16mm

### Issue: Hall Sensor Sensitivity
- **Problem:** Cogging, rough start
- **Solution:** Ferrite rings on hall wires, proper shielding
- **Workaround:** Higher sensorless ERPM threshold

### Issue: Overheating
- **Problem:** Thermal rollback on sustained hills
- **Solution:** HubSinks (essential!), Statorade
- **Prevention:** Monitor VESC temp data, back off when hot

### Issue: Gear Strip (Freewheel)
- **Problem:** 7-speed freewheel threads strip under torque
- **Solution:** Use steel freewheel, check tightness
- **Prevention:** Single speed for high power, threadlocker

### Issue: Counterfeits
- **Risk:** Clones with inferior magnets
- **Solution:** Buy from reputable sellers
- **Verification:** Compare weight, magnet quality

---

## Sources

### Sellers/Distributors
- Elecycles MXUS Page: https://www.elecycles.com/mxus-3000w-motor-brushless-electric-bike-rear-hub-motor.html
- MyElectricBikeMotor: https://myelectricbikemotor.com/mxus-v3-3k-turbo-3000w-high-speed-electric-e-bike-hub-motor-48v-60v-72v-84v-96v/
- E Bike Power UK: https://ebikepoweruk.com/product/3000w-mtx-rim-e-bike-conversion-kit-electric-e-bike-rear-wheel-motor-60v-72v-26-27-5-29-60-amp-sine-wave/
- The Ebike Shop UK: https://theebikeshop.co.uk/products/uk-stock-72v-3000w-kit-with-battery

### Community
- Endless Sphere MXUS Threads: https://endless-sphere.com/sphere/threads/mxus-3k-turbo-v3.109170/
- VESC Project Forum
- Reddit r/ebikes

### Alibaba
- MXUS Official: https://www.alibaba.com/product-detail/MXUS-3k-Turbo-3000w-Ebike-Motor_1600995157156.html

---

## Summary

The MXUS 3K Turbo V3 is an excellent choice for:
- ✅ Budget-conscious high-power builds
- ✅ Speed-focused street builds
- ✅ VESC conversions
- ✅ Riders wanting QS205 performance at lower cost
- ✅ First-time high-power builders

Consider alternatives if:
- ❌ You need absolute maximum reliability (QS205 better)
- ❌ You need 100+ km/h sustained (consider QS273)
- ❌ Weight is critical (hub motors are heavy)

**Bottom Line:** Best value in the 3000W hub motor category. With proper VESC tuning and thermal management, can deliver 5000W+ continuous and 8000W+ peaks reliably.

---

*Last Updated: May 2026*
