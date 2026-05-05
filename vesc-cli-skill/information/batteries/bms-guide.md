# Battery Management System (BMS) Guide

## What is a BMS?

A Battery Management System (BMS) is an electronic system that manages and protects rechargeable battery packs. It's essential for multi-cell lithium battery packs to ensure safe operation, long life, and optimal performance.

**Core Functions:**
1. **Cell Monitoring:** Tracks voltage of each cell group
2. **Protection:** Prevents overcharge, over-discharge, over-current
3. **Balancing:** Equalizes charge across all cells
4. **Safety:** Shuts down pack if dangerous conditions detected
5. **Communication:** Reports status to VESC/controller

---

## Why a BMS is Essential

### Without a BMS:
- Cells can drift apart in voltage over time
- Overcharged cells risk thermal runaway (fire/explosion)
- Over-discharged cells become permanently damaged
- No protection from short circuits or excessive current
- Cannot safely use the full pack capacity
- Reduced battery lifespan

### With a Proper BMS:
- Cells stay balanced within safe voltage range
- Protection from dangerous over/under voltage
- Automatic cutoff on fault conditions
- Extended battery lifespan (2-3x longer)
- Safe charging and discharging
- Monitoring and diagnostics capability

---

## Key BMS Functions

### 1. Cell Balancing

**Purpose:** Keep all cells at equal voltage

**Why Needed:**
- No two cells are identical
- Small differences grow over time
- Without balancing, weakest cell limits entire pack
- Strongest cell may overcharge while weakest is still charging

**Balancing Methods:**

**Passive Balancing (most common):**
- Bleeds excess energy from higher cells via resistors
- Simple, reliable, lower cost
- Generates small amount of heat
- Slower for large imbalances

**Active Balancing (advanced):**
- Transfers energy from higher to lower cells
- More efficient, less heat
- Faster balancing
- More complex, higher cost

**When Balancing Occurs:**
- During charging (typically near full)
- Some BMS balance continuously
- Balancing current: 50-200mA typical

### 2. Overcharge Protection (HVC - High Voltage Cutoff)

**Function:** Stops charging when any cell reaches max voltage

**Typical Settings (Li-ion):**
- Cutoff: 4.20V per cell (4.25V absolute max)
- Warning: 4.15V per cell
- Hysteresis: Re-enable at ~4.10V

**Actions:**
- Opens charge FET
- May signal charger to stop
- Prevents dangerous overcharge condition

### 3. Over-discharge Protection (LVC - Low Voltage Cutoff)

**Function:** Stops discharge when any cell drops too low

**Typical Settings (Li-ion):**
- Cutoff: 2.50-3.00V per cell
- Warning: 3.20V per cell
- Hysteresis: Re-enable at ~3.40V

**Actions:**
- Opens discharge FET
- Protects cells from permanent damage
- Preserves enough charge for emergency

### 4. Over-Current Protection

**Function:** Limits charge and discharge current

**Settings:**
- Continuous discharge limit
- Peak discharge limit (momentary)
- Charge current limit
- Typically 20-50% above expected max use

**Types:**
- **Over-Current Discharge (OCD):** Too much load current
- **Over-Current Charge (OCC):** Excessive charging/regen current
- **Short Circuit Protection:** Very high instantaneous current

### 5. Temperature Monitoring

**Function:** Prevents operation outside safe temperature

**Typical Limits:**
- Charge: 0°C to 45°C
- Discharge: -20°C to 60°C
- Emergency cutoff: 65-70°C

**Why Important:**
- Charging below freezing damages cells
- High temperature accelerates degradation
- Very high temperature indicates fault

**Implementation:**
- Thermistor on BMS PCB
- Additional thermistors on pack
- BMS reads and acts on temperature

---

## BMS Types

### By Protection Scope

**Charge-Only BMS:**
- Protects during charging only
- No discharge protection
- Smaller, cheaper
- **Use when:** VESC provides discharge cutoff
- Common in DIY e-skate builds

**Charge + Discharge BMS:**
- Full protection always active
- FETs control both charge and discharge paths
- Recommended for safety
- Required for most commercial applications

### By Communication

**Standard BMS:**
- No external communication
- Standalone operation
- LED indicators only
- Lower cost

**Smart BMS (with communication):**
- Bluetooth connectivity
- UART/CAN bus communication
- Cell voltage reporting
- Configuration via app/software
- Integration with VESC

---

## Popular BMS Manufacturers

### VESC-Compatible Smart BMS

#### 1. ENNOID BMS (DieBieMS successor)

**Overview:**
- Commercial evolution of open-source DieBieMS
- Full VESC-tool compatibility
- CAN bus communication
- Designed for electric skateboards

**Features:**
- CAN bus integration with VESC
- Per-cell voltage reporting
- Temperature monitoring
- Configurable via VESC Tool
- Firmware updates via VESC Tool

**Specifications:**
- Cell count: Up to 12S
- Current: Various ratings (60A, 100A+)
- Communication: CAN bus, USB
- Balancing: Passive

**Website:** https://www.ennoid.me/bms

**Best For:**
- VESC-based builds wanting integrated monitoring
- Users wanting single-tool configuration
- Premium builds requiring CAN communication

---

#### 2. DieBieMS (Open Source)

**Overview:**
- Original open-source BMS for e-skate
- Open hardware and firmware
- High-quality design
- Community supported

**Features:**
- High-side switching
- Isolated CAN bus
- USB interface
- Soft power switch
- Precharge circuit
- Compatible with VESC

**Specifications:**
- Cell count: Up to 12S
- Current: 70A continuous, 100A peak
- Pack voltage: 12V to 54V
- STM32F3 microcontroller

**Repository:** https://github.com/DieBieEngineering/DieBieMS

**Status:**
- Superseded by ENNOID BMS commercially
- Still viable for DIY builders
- Active community support

---

### Commercial Smart BMS

#### 3. Daly BMS

**Overview:**
- Popular budget-friendly BMS
- Available in smart versions with Bluetooth
- Widely available
- Good for standard configurations

**Features:**
- Bluetooth connectivity (smart versions)
- RS485 and CAN options
- Temperature monitoring
- Various current ratings
- Active balancing options (premium)

**Specifications:**
- Cell count: 3S to 24S
- Current: 20A to 200A+
- Options: Standard, Smart (Bluetooth), CAN/RS485

**Configuration:**
- "Smart BMS" app (Android/iOS)
- Desktop software available
- Adjustable voltage limits

**Where to Buy:**
- AliExpress (official Daly store)
- Battery supply websites
- Various e-commerce platforms

**Best For:**
- Budget builds
- Standard configurations
- E-bike applications
- Builders wanting app connectivity

---

#### 4. JBD BMS (JiaBaiDa)

**Overview:**
- Chinese manufacturer
- Very popular in DIY community
- Feature-rich smart BMS
- Good value for money

**Features:**
- Bluetooth (standard on most)
- UART communication
- Active and passive balancing options
- Temperature sensors
- Various communication protocols

**Specifications:**
- Cell count: 3S to 32S
- Current: 10A to 300A
- Protocols: UART, RS485, CAN
- App: "Xiaoxiang BMS" or "JBD BMS"

**Configuration:**
- Mobile app (Xiaoxiang)
- PC software
- Adjustable all parameters

**Where to Buy:**
- AliExpress
- Battery supply stores
- Various online retailers

**Best For:**
- Feature-rich budget option
- Various cell counts
- Builders wanting active balancing

---

#### 5. ANT BMS

**Overview:**
- Another popular Chinese smart BMS
- Good reputation for reliability
- Feature-rich

**Features:**
- Bluetooth connectivity
- LCD display option
- Touch screen version available
- Multiple communication options

**Specifications:**
- Cell count: 4S to 32S
- Current: 20A to 300A
- App: "ANT BMS"

**Best For:**
- Builders wanting LCD display
- Budget-conscious builders
- Various applications

---

#### 6. Bestech BMS

**Overview:**
- Long-established manufacturer
- Popular in e-skate community
- Custom order options

**Features:**
- Custom voltage/current settings
- Reliable operation
- E-switch versions
- Various balancing currents

**Specifications:**
- Cell count: 4S to 20S (custom)
- Current: Various ratings
- Options: HCX-D series popular for e-skate

**How to Order:**
- Contact directly for custom specs
- Minimum order quantities
- Specify exact voltage cutoffs needed

**Best For:**
- Custom voltage requirements
- Reliable known quantity
- Bulk orders

---

## BMS Selection Guide

### By Application

| Application | Recommended BMS | Why |
|-------------|---------------|-----|
| VESC e-skate | ENNOID, DieBieMS | VESC integration |
| Budget e-skate | JBD, Daly Smart | Cost-effective with features |
| E-bike 14S+ | Daly, ANT, JBD | Higher cell counts |
| E-motorcycle | Daly HV, ANT HV | High voltage capable |
| Competition/Racing | ENNOID, Bestech | Reliability critical |
| Learning/DIY | Any 10S charge-only | Low cost entry |

### By Cell Count

| Cells | Compatible BMS | Notes |
|-------|---------------|-------|
| 6S-10S | Most standard BMS | Widely available |
| 12S | ENNOID, DieBieMS, Daly, JBD, ANT | Common e-skate voltage |
| 13S | Daly, JBD, ANT | V6 VESC only |
| 14S-16S | Daly, JBD, ANT HV | E-bike range |
| 20S+ | Daly HV, specialized | HV controllers only |

### By Current Rating

| Pack Current | Minimum BMS | Recommended |
|--------------|-------------|-------------|
| <30A | 40A BMS | 60A BMS |
| 30-50A | 60A BMS | 80A BMS |
| 50-80A | 80A BMS | 100A BMS |
| 80-120A | 100A BMS | 150A BMS |
| >120A | 150A+ BMS | 200A+ BMS |

### By Feature Requirements

| Need | Recommended BMS |
|------|-----------------|
| VESC integration | ENNOID, DieBieMS |
| Bluetooth monitoring | Daly Smart, JBD, ANT |
| Active balancing | JBD (select models), premium options |
| LCD display | ANT (touch versions) |
| CAN bus | ENNOID, Daly CAN, DieBieMS |
| Budget option | Standard Daly, basic JBD |
| High reliability | Bestech, ENNOID |

---

## BMS Configuration

### Voltage Settings

**Standard Li-ion NMC (per cell):**
```
Overcharge Protection:     4.20V - 4.25V
Overcharge Release:        4.10V - 4.15V
Overdischarge Protection:  2.50V - 3.00V
Overdischarge Release:     3.00V - 3.40V
```

**Conservative Settings (Extended Life):**
```
Overcharge Protection:     4.10V - 4.15V
Overcharge Release:        4.05V - 4.10V
Overdischarge Protection:  3.00V - 3.20V
Overdischarge Release:     3.20V - 3.40V
```

**LiFePO4 Settings (per cell):**
```
Overcharge Protection:     3.60V - 3.65V
Overdischarge Protection:  2.00V - 2.50V
```

### Current Settings

**Calculation:**
```
Continuous Discharge = Cell Rating × P-count × 0.8 (derating)
Peak Discharge = Continuous × 1.5
Charge Current = Cell Max Charge × P-count
```

**Example (10S4P Samsung 30Q):**
```
Cell max discharge: 15A
P-count: 4
Continuous: 15A × 4 × 0.8 = 48A → Set BMS to 60A (headroom)
Peak: 60A × 1.5 = 90A
Charge: 4A × 4 = 16A
```

### Temperature Settings

**Standard Li-ion:**
```
Charge Temperature Min:    0°C
Charge Temperature Max:    45°C
Discharge Temperature Min: -20°C
Discharge Temperature Max: 60°C
Emergency Cutoff:          70°C
```

---

## BMS Installation

### Wiring

**Main Power Path:**
- B- (Battery negative) → Cells negative
- B+ (Battery positive) → Cells positive
- P- (Pack negative) → VESC/controller negative
- C- (Charge negative, if separate) → Charger negative

**Balance Leads:**
- One wire per cell group (series connection)
- Connect in order: B-, 1, 2, 3... B+
- Must be correct order or BMS will be damaged
- Use proper connector (JST-XH or as specified)

**Temperature Sensors:**
- Place on cells or near hottest area
- Secure with kapton tape
- Connect to BMS temp input

### Physical Mounting

**Considerations:**
- Allow airflow for BMS cooling
- Keep away from moisture
- Mount to prevent vibration damage
- Accessible for troubleshooting
- Away from cells (if FETs get hot)

**Thermal Management:**
- FETs generate heat during high current
- Some BMS have thermal protection
- Consider heatsinking for >60A applications
- Monitor BMS temperature in use

---

## VESC Integration

### BMS Communication with VESC

**ENNOID/DieBieMS (CAN bus):**
```
VESC Configuration:
- Enable BMS support in app settings
- Set BMS type to "ENNOID" or "DieBieMS"
- CAN bus connection between VESC and BMS
- VESC Tool displays cell voltages, temperatures
```

**Benefits:**
- Single configuration tool (VESC Tool)
- Real-time monitoring
- Automatic current limiting based on BMS data
- Firmware updates through VESC

### Using Charge-Only BMS with VESC

**Setup:**
- BMS handles charging protection only
- VESC provides discharge protection
- Configure VESC voltage cutoffs:
  ```
  Battery Voltage Cutoff Start: 33V (for 10S)
  Battery Voltage Cutoff End: 30V (for 10S)
  ```

**Advantages:**
- Smaller BMS
- Less voltage drop (no discharge FETs)
- VESC protects during use
- Simpler wiring

**Disadvantages:**
- No cell balancing during discharge
- Must trust VESC for protection
- No cell-level monitoring

---

## Troubleshooting

### Common Issues

**BMS Won't Allow Charging:**
- Check for overvoltage protection (cell at 4.2V)
- Temperature out of range
- Check balance connections
- Verify charger voltage matches pack

**BMS Won't Allow Discharge:**
- Check for undervoltage protection
- Temperature too high
- Overcurrent protection triggered
- Short circuit detection

**Cells Not Balancing:**
- Verify balance connections correct
- Some BMS only balance near full charge
- Large imbalances take time to correct
- May need manual balance if severely unbalanced

**BMS Getting Hot:**
- Current too high for BMS rating
- Poor thermal design
- FETs undersized for application
- Upgrade BMS or improve cooling

### Diagnostic Steps

1. **Check cell voltages** with multimeter
2. **Verify balance connections** - correct order?
3. **Check BMS app/software** for error codes
4. **Test at low current** - does it work?
5. **Monitor temperatures** - are cells/BMS hot?
6. **Check for physical damage** to BMS or cells

---

## Best Practices

### Design Phase
- Choose BMS with 20% more current capacity than needed
- Plan for thermal management
- Consider communication needs
- Verify cell count compatibility

### Installation
- Double-check balance wire order
- Use proper gauge wire for current
- Secure all connections
- Test without load first
- Monitor first charge cycles

### Operation
- Don't exceed BMS current ratings
- Monitor cell balance periodically
- Keep BMS and pack cool
- Respond to protection events
- Update firmware if available

### Maintenance
- Check cell balance monthly
- Verify protection functions work
- Clean and inspect connections
- Update BMS configuration as cells age

---

## Resources

### Manufacturers
- **ENNOID:** https://www.ennoid.me
- **Daly:** Various retailers (AliExpress official store)
- **JBD:** Various retailers
- **ANT BMS:** Various retailers
- **Bestech:** Contact for orders

### Community Resources
- **VESC Project BMS Docs:** https://vedderb-bldc.mintlify.app/hardware/bms
- **DieBieMS GitHub:** https://github.com/DieBieEngineering/DieBieMS
- **ESK8 Forum:** https://forum.esk8.news
- **Endless Sphere:** https://endless-sphere.com

### Documentation
- VESC BMS Integration Guide
- Manufacturer app manuals
- Community build threads

---

*Document Version: 1.0*
*Last Updated: May 2026*
*BMS Systems Covered: 6 major manufacturers*
