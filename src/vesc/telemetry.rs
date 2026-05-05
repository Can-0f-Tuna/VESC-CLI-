//! Motor telemetry (MC_VALUES) parsing
//!
//! This module provides complete parsing of the COMM_GET_VALUES response
//! from VESC motor controllers, including all telemetry fields and fault codes.
//!
//! The VESC protocol uses little-endian format for all numeric values.

use crate::vesc::protocol::{DecodedPacket, ProtocolError};
use serde::Serialize;

/// Complete motor telemetry data from COMM_GET_VALUES
///
/// This structure contains all telemetry fields returned by the VESC
/// in response to a COMM_GET_VALUES command. The data is transmitted
/// in little-endian format with 4-byte floating point values.
#[derive(Debug, Clone, Serialize, Default, PartialEq)]
pub struct MotorTelemetry {
    // Input/Power
    /// Input voltage in volts (V)
    pub v_in: f32,
    /// Input current in amperes (A)
    pub current_in: f32,
    /// Calculated input power in watts (W) = v_in * current_in
    #[serde(skip_serializing_if = "Option::is_none")]
    pub power_in: Option<f32>,

    // Motor
    /// Motor current in amperes (A)
    pub current_motor: f32,
    /// Motor RPM (revolutions per minute)
    pub rpm: i32,
    /// Duty cycle as a ratio (0.0 to 1.0, where 1.0 = 100%)
    pub duty_cycle: f32,

    // Temperatures
    /// MOSFET temperature in degrees Celsius
    pub temp_mos: f32,
    /// Motor temperature in degrees Celsius
    pub temp_motor: f32,

    // Currents (FOC - Field Oriented Control)
    /// D-axis current (direct current component)
    pub current_id: f32,
    /// Q-axis current (quadrature current component)
    pub current_iq: f32,

    // Energy
    /// Amp-hours consumed since reset
    pub amp_hours: f32,
    /// Amp-hours charged/regenerated since reset
    pub amp_hours_charged: f32,
    /// Watt-hours consumed since reset
    pub watt_hours: f32,
    /// Watt-hours charged/regenerated since reset
    pub watt_hours_charged: f32,

    // Position
    /// Tachometer count (signed, tracks direction)
    pub tachometer: i32,
    /// Absolute tachometer count (always positive)
    pub tachometer_abs: i32,
    /// Encoder position in degrees (if encoder is available)
    pub encoder_position: f32,

    // Status
    /// Active fault code
    pub fault_code: FaultCode,
    /// Human-readable fault description
    pub fault_str: String,
}

impl MotorTelemetry {
    /// Check if any fault is active
    pub fn has_fault(&self) -> bool {
        self.fault_code != FaultCode::None
    }

    /// Calculate input power if not already calculated
    pub fn calculate_power(&mut self) {
        self.power_in = Some(self.v_in * self.current_in);
    }

    /// Get duty cycle as a percentage (0-100)
    pub fn duty_percentage(&self) -> f32 {
        self.duty_cycle * 100.0
    }

    /// Get net amp-hours (consumed - charged)
    pub fn net_amp_hours(&self) -> f32 {
        self.amp_hours - self.amp_hours_charged
    }

    /// Get net watt-hours (consumed - charged)
    pub fn net_watt_hours(&self) -> f32 {
        self.watt_hours - self.watt_hours_charged
    }
}

/// VESC fault codes
///
/// These fault codes indicate various error conditions that can occur
/// in the VESC motor controller. A fault code of 0 (None) indicates
/// normal operation.
#[derive(Debug, Clone, Copy, Serialize, Default, PartialEq, Eq)]
#[repr(u8)]
pub enum FaultCode {
    /// No fault - normal operation
    #[default]
    None = 0,
    /// Over voltage - input voltage exceeded maximum
    OverVoltage = 1,
    /// Under voltage - input voltage below minimum
    UnderVoltage = 2,
    /// DRV8302 driver fault (older VESC hardware)
    Drv = 3,
    /// Absolute over current - current exceeded absolute maximum
    AbsOverCurrent = 4,
    /// Over temperature on FETs (MOSFETs)
    OverTempFet = 5,
    /// Over temperature on motor
    OverTempMotor = 6,
    /// Gate driver over voltage
    GateDriverOverVoltage = 7,
    /// Gate driver under voltage
    GateDriverUnderVoltage = 8,
    /// MCU under voltage
    McuUnderVoltage = 9,
    /// Booting from watchdog reset
    BootingFromWatchdog = 10,
    /// Encoder SPI communication fault
    EncoderSpi = 11,
    /// Encoder SIN/COS amplitude below minimum
    EncoderSincosLow = 12,
    /// Encoder SIN/COS amplitude above maximum
    EncoderSincosHigh = 13,
    /// Flash memory corruption detected
    FlashCorruption = 14,
    /// High offset on current sensor 1
    HighOffsetCurrent1 = 15,
    /// High offset on current sensor 2
    HighOffsetCurrent2 = 16,
    /// High offset on current sensor 3
    HighOffsetCurrent3 = 17,
    /// Unbalanced currents between phases
    UnbalancedCurrents = 18,
    /// Brake fault
    Brake = 19,
    /// Resolver LOT (Loss of Tracking) fault
    ResolverLot = 20,
    /// Resolver DOS (Degradation of Signal) fault
    ResolverDos = 21,
    /// Resolver LOS (Loss of Signal) fault
    ResolverLos = 22,
    /// Flash corruption in application configuration
    FlashCorruptionAppCfg = 23,
    /// Flash corruption in motor controller configuration
    FlashCorruptionMcCfg = 24,
    /// Encoder no magnet detected
    EncoderNoMagnet = 25,
    /// Encoder magnet too strong
    EncoderMagnetTooStrong = 26,
    /// Phase filter fault
    PhaseFilter = 27,
    /// General encoder fault
    EncoderFault = 28,
    /// Low voltage output fault
    LvOutputFault = 29,
    /// Encoder slip detected
    EncoderSlip = 30,
    /// Overspeed - RPM exceeded maximum
    Overspeed = 31,
    /// Underspeed - RPM below minimum (for certain modes)
    Underspeed = 32,
    /// Absolute overspeed - RPM exceeded absolute maximum
    AbsOverspeed = 33,
}

impl FaultCode {
    /// Convert a u8 value to the corresponding FaultCode
    ///
    /// Returns FaultCode::None for unknown fault codes (0 is valid - None)
    pub fn from_u8(code: u8) -> Self {
        match code {
            0 => FaultCode::None,
            1 => FaultCode::OverVoltage,
            2 => FaultCode::UnderVoltage,
            3 => FaultCode::Drv,
            4 => FaultCode::AbsOverCurrent,
            5 => FaultCode::OverTempFet,
            6 => FaultCode::OverTempMotor,
            7 => FaultCode::GateDriverOverVoltage,
            8 => FaultCode::GateDriverUnderVoltage,
            9 => FaultCode::McuUnderVoltage,
            10 => FaultCode::BootingFromWatchdog,
            11 => FaultCode::EncoderSpi,
            12 => FaultCode::EncoderSincosLow,
            13 => FaultCode::EncoderSincosHigh,
            14 => FaultCode::FlashCorruption,
            15 => FaultCode::HighOffsetCurrent1,
            16 => FaultCode::HighOffsetCurrent2,
            17 => FaultCode::HighOffsetCurrent3,
            18 => FaultCode::UnbalancedCurrents,
            19 => FaultCode::Brake,
            20 => FaultCode::ResolverLot,
            21 => FaultCode::ResolverDos,
            22 => FaultCode::ResolverLos,
            23 => FaultCode::FlashCorruptionAppCfg,
            24 => FaultCode::FlashCorruptionMcCfg,
            25 => FaultCode::EncoderNoMagnet,
            26 => FaultCode::EncoderMagnetTooStrong,
            27 => FaultCode::PhaseFilter,
            28 => FaultCode::EncoderFault,
            29 => FaultCode::LvOutputFault,
            30 => FaultCode::EncoderSlip,
            31 => FaultCode::Overspeed,
            32 => FaultCode::Underspeed,
            33 => FaultCode::AbsOverspeed,
            _ => FaultCode::None, // Default to None for unknown codes
        }
    }

    /// Get a human-readable description of the fault
    pub fn description(&self) -> &'static str {
        match self {
            FaultCode::None => "No fault",
            FaultCode::OverVoltage => "Over voltage - input voltage too high",
            FaultCode::UnderVoltage => "Under voltage - input voltage too low",
            FaultCode::Drv => "DRV driver fault",
            FaultCode::AbsOverCurrent => "Absolute over current",
            FaultCode::OverTempFet => "Over temperature - MOSFETs",
            FaultCode::OverTempMotor => "Over temperature - motor",
            FaultCode::GateDriverOverVoltage => "Gate driver over voltage",
            FaultCode::GateDriverUnderVoltage => "Gate driver under voltage",
            FaultCode::McuUnderVoltage => "MCU under voltage",
            FaultCode::BootingFromWatchdog => "Booting from watchdog reset",
            FaultCode::EncoderSpi => "Encoder SPI fault",
            FaultCode::EncoderSincosLow => "Encoder SIN/COS low amplitude",
            FaultCode::EncoderSincosHigh => "Encoder SIN/COS high amplitude",
            FaultCode::FlashCorruption => "Flash corruption",
            FaultCode::HighOffsetCurrent1 => "High offset - current sensor 1",
            FaultCode::HighOffsetCurrent2 => "High offset - current sensor 2",
            FaultCode::HighOffsetCurrent3 => "High offset - current sensor 3",
            FaultCode::UnbalancedCurrents => "Unbalanced phase currents",
            FaultCode::Brake => "Brake fault",
            FaultCode::ResolverLot => "Resolver loss of tracking",
            FaultCode::ResolverDos => "Resolver degradation of signal",
            FaultCode::ResolverLos => "Resolver loss of signal",
            FaultCode::FlashCorruptionAppCfg => "Flash corruption - app config",
            FaultCode::FlashCorruptionMcCfg => "Flash corruption - motor config",
            FaultCode::EncoderNoMagnet => "Encoder - no magnet detected",
            FaultCode::EncoderMagnetTooStrong => "Encoder - magnet too strong",
            FaultCode::PhaseFilter => "Phase filter fault",
            FaultCode::EncoderFault => "Encoder fault",
            FaultCode::LvOutputFault => "Low voltage output fault",
            FaultCode::EncoderSlip => "Encoder slip detected",
            FaultCode::Overspeed => "Overspeed - RPM too high",
            FaultCode::Underspeed => "Underspeed - RPM too low",
            FaultCode::AbsOverspeed => "Absolute overspeed",
        }
    }

    /// Check if this fault is critical (requires immediate attention)
    pub fn is_critical(&self) -> bool {
        matches!(
            self,
            FaultCode::OverVoltage
                | FaultCode::UnderVoltage
                | FaultCode::AbsOverCurrent
                | FaultCode::OverTempFet
                | FaultCode::OverTempMotor
                | FaultCode::FlashCorruption
                | FaultCode::AbsOverspeed
        )
    }

    /// Check if this fault is recoverable (may clear on its own)
    pub fn is_recoverable(&self) -> bool {
        matches!(
            self,
            FaultCode::OverVoltage
                | FaultCode::UnderVoltage
                | FaultCode::OverTempFet
                | FaultCode::OverTempMotor
                | FaultCode::Overspeed
                | FaultCode::Underspeed
        )
    }
}

impl DecodedPacket {
    /// Parse MC_VALUES from COMM_GET_VALUES response
    ///
    /// The payload structure (all values in little-endian):
    /// - v_in: f32 (4 bytes)
    /// - temp_mos: f32 (4 bytes)
    /// - temp_motor: f32 (4 bytes)
    /// - current_motor: f32 (4 bytes)
    /// - current_in: f32 (4 bytes)
    /// - id: f32 (4 bytes)
    /// - iq: f32 (4 bytes)
    /// - rpm: f32 (4 bytes) - sent as float but represents integer
    /// - duty_now: f32 (4 bytes)
    /// - amp_hours: f32 (4 bytes)
    /// - amp_hours_charged: f32 (4 bytes)
    /// - watt_hours: f32 (4 bytes)
    /// - watt_hours_charged: f32 (4 bytes)
    /// - tachometer: i32 (4 bytes)
    /// - tachometer_abs: i32 (4 bytes)
    /// - position: f32 (4 bytes)
    /// - fault_code: u8 (1 byte)
    ///
    /// Total: 73 bytes minimum
    ///
    /// # Errors
    /// Returns `ProtocolError::BufferTooSmall` if the payload is too short
    pub fn parse_mc_values(&self) -> Result<MotorTelemetry, ProtocolError> {
        // VESC sends the command byte as the first byte of payload, but our
        // DecodedPacket already strips it. The payload starts directly with data.
        let data = &self.payload;

        // Minimum expected size: 18 f32 values (72 bytes) + 1 i8 (fault_code) = 73 bytes
        const MIN_SIZE: usize = 73;

        if data.len() < MIN_SIZE {
            return Err(ProtocolError::BufferTooSmall {
                required: MIN_SIZE,
                available: data.len(),
            });
        }

        let mut offset = 0;

        // Parse all float values
        let v_in = read_f32_le(data, &mut offset)?;
        let temp_mos = read_f32_le(data, &mut offset)?;
        let temp_motor = read_f32_le(data, &mut offset)?;
        let current_motor = read_f32_le(data, &mut offset)?;
        let current_in = read_f32_le(data, &mut offset)?;
        let current_id = read_f32_le(data, &mut offset)?;
        let current_iq = read_f32_le(data, &mut offset)?;
        let rpm_f32 = read_f32_le(data, &mut offset)?;
        let duty_cycle = read_f32_le(data, &mut offset)?;
        let amp_hours = read_f32_le(data, &mut offset)?;
        let amp_hours_charged = read_f32_le(data, &mut offset)?;
        let watt_hours = read_f32_le(data, &mut offset)?;
        let watt_hours_charged = read_f32_le(data, &mut offset)?;

        // Parse integer values
        let tachometer = read_i32_le(data, &mut offset)?;
        let tachometer_abs = read_i32_le(data, &mut offset)?;

        // Parse encoder position
        let encoder_position = read_f32_le(data, &mut offset)?;

        // Parse fault code (single byte)
        let fault_code_byte = data.get(offset).copied().unwrap_or(0);
        let fault_code = FaultCode::from_u8(fault_code_byte);
        let fault_str = fault_code.description().to_string();

        // RPM is sent as float but represents integer value
        let rpm = rpm_f32 as i32;

        // Calculate input power
        let power_in = v_in * current_in;

        Ok(MotorTelemetry {
            v_in,
            current_in,
            power_in: Some(power_in),
            current_motor,
            rpm,
            duty_cycle,
            temp_mos,
            temp_motor,
            current_id,
            current_iq,
            amp_hours,
            amp_hours_charged,
            watt_hours,
            watt_hours_charged,
            tachometer,
            tachometer_abs,
            encoder_position,
            fault_code,
            fault_str,
        })
    }
}

/// Read a little-endian f32 from the data buffer
///
/// Advances the offset by 4 bytes on success
fn read_f32_le(data: &[u8], offset: &mut usize) -> Result<f32, ProtocolError> {
    if data.len() < *offset + 4 {
        return Err(ProtocolError::BufferTooSmall {
            required: *offset + 4,
            available: data.len(),
        });
    }

    let bytes = &data[*offset..*offset + 4];
    *offset += 4;

    Ok(f32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
}

/// Read a little-endian i32 from the data buffer
///
/// Advances the offset by 4 bytes on success
fn read_i32_le(data: &[u8], offset: &mut usize) -> Result<i32, ProtocolError> {
    if data.len() < *offset + 4 {
        return Err(ProtocolError::BufferTooSmall {
            required: *offset + 4,
            available: data.len(),
        });
    }

    let bytes = &data[*offset..*offset + 4];
    *offset += 4;

    Ok(i32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Create a test MC_VALUES payload
    fn create_test_payload() -> Vec<u8> {
        let mut payload = Vec::new();

        // v_in = 50.0
        payload.extend_from_slice(&50.0f32.to_le_bytes());
        // temp_mos = 45.0
        payload.extend_from_slice(&45.0f32.to_le_bytes());
        // temp_motor = 35.0
        payload.extend_from_slice(&35.0f32.to_le_bytes());
        // current_motor = 10.0
        payload.extend_from_slice(&10.0f32.to_le_bytes());
        // current_in = 8.0
        payload.extend_from_slice(&8.0f32.to_le_bytes());
        // id = 2.0
        payload.extend_from_slice(&2.0f32.to_le_bytes());
        // iq = 9.5
        payload.extend_from_slice(&9.5f32.to_le_bytes());
        // rpm = 1500.0 (as float)
        payload.extend_from_slice(&1500.0f32.to_le_bytes());
        // duty_now = 0.75
        payload.extend_from_slice(&0.75f32.to_le_bytes());
        // amp_hours = 1.5
        payload.extend_from_slice(&1.5f32.to_le_bytes());
        // amp_hours_charged = 0.2
        payload.extend_from_slice(&0.2f32.to_le_bytes());
        // watt_hours = 75.0
        payload.extend_from_slice(&75.0f32.to_le_bytes());
        // watt_hours_charged = 10.0
        payload.extend_from_slice(&10.0f32.to_le_bytes());
        // tachometer = 5000
        payload.extend_from_slice(&5000i32.to_le_bytes());
        // tachometer_abs = 5000
        payload.extend_from_slice(&5000i32.to_le_bytes());
        // position = 180.0
        payload.extend_from_slice(&180.0f32.to_le_bytes());
        // fault_code = 0 (None)
        payload.push(0);

        payload
    }

    #[test]
    fn test_parse_mc_values() {
        let payload = create_test_payload();
        let packet = DecodedPacket::new(Command::CommGetValues, payload);

        let telemetry = packet.parse_mc_values().unwrap();

        assert!((telemetry.v_in - 50.0).abs() < 0.01);
        assert!((telemetry.temp_mos - 45.0).abs() < 0.01);
        assert!((telemetry.temp_motor - 35.0).abs() < 0.01);
        assert!((telemetry.current_motor - 10.0).abs() < 0.01);
        assert!((telemetry.current_in - 8.0).abs() < 0.01);
        assert!((telemetry.current_id - 2.0).abs() < 0.01);
        assert!((telemetry.current_iq - 9.5).abs() < 0.01);
        assert_eq!(telemetry.rpm, 1500);
        assert!((telemetry.duty_cycle - 0.75).abs() < 0.01);
        assert!((telemetry.amp_hours - 1.5).abs() < 0.01);
        assert!((telemetry.amp_hours_charged - 0.2).abs() < 0.01);
        assert!((telemetry.watt_hours - 75.0).abs() < 0.01);
        assert!((telemetry.watt_hours_charged - 10.0).abs() < 0.01);
        assert_eq!(telemetry.tachometer, 5000);
        assert_eq!(telemetry.tachometer_abs, 5000);
        assert!((telemetry.encoder_position - 180.0).abs() < 0.01);
        assert_eq!(telemetry.fault_code, FaultCode::None);
        assert_eq!(telemetry.fault_str, "No fault");
        assert!(telemetry.power_in.unwrap() > 0.0);
    }

    #[test]
    fn test_parse_mc_values_buffer_too_small() {
        let payload = vec![0u8; 10]; // Too small
        let packet = DecodedPacket::new(Command::CommGetValues, payload);

        let result = packet.parse_mc_values();
        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            ProtocolError::BufferTooSmall { .. }
        ));
    }

    #[test]
    fn test_fault_code_from_u8() {
        assert_eq!(FaultCode::from_u8(0), FaultCode::None);
        assert_eq!(FaultCode::from_u8(1), FaultCode::OverVoltage);
        assert_eq!(FaultCode::from_u8(5), FaultCode::OverTempFet);
        assert_eq!(FaultCode::from_u8(33), FaultCode::AbsOverspeed);
        // Unknown codes should map to None
        assert_eq!(FaultCode::from_u8(100), FaultCode::None);
        assert_eq!(FaultCode::from_u8(255), FaultCode::None);
    }

    #[test]
    fn test_fault_code_description() {
        assert!(FaultCode::None.description().contains("No fault"));
        assert!(FaultCode::OverVoltage.description().contains("Over voltage"));
        assert!(FaultCode::OverTempFet.description().contains("MOSFET"));
    }

    #[test]
    fn test_fault_code_is_critical() {
        assert!(!FaultCode::None.is_critical());
        assert!(FaultCode::OverVoltage.is_critical());
        assert!(FaultCode::OverTempFet.is_critical());
        assert!(!FaultCode::EncoderSpi.is_critical());
    }

    #[test]
    fn test_fault_code_is_recoverable() {
        assert!(FaultCode::OverVoltage.is_recoverable());
        assert!(FaultCode::OverTempFet.is_recoverable());
        assert!(!FaultCode::FlashCorruption.is_recoverable());
    }

    #[test]
    fn test_motor_telemetry_helpers() {
        let mut telemetry = MotorTelemetry {
            v_in: 50.0,
            current_in: 10.0,
            power_in: None,
            amp_hours: 10.0,
            amp_hours_charged: 2.0,
            watt_hours: 500.0,
            watt_hours_charged: 100.0,
            duty_cycle: 0.75,
            ..Default::default()
        };

        assert!(!telemetry.has_fault());
        assert!((telemetry.duty_percentage() - 75.0).abs() < 0.01);
        assert!((telemetry.net_amp_hours() - 8.0).abs() < 0.01);
        assert!((telemetry.net_watt_hours() - 400.0).abs() < 0.01);

        telemetry.calculate_power();
        assert!(telemetry.power_in.is_some());
        assert!((telemetry.power_in.unwrap() - 500.0).abs() < 0.01);

        telemetry.fault_code = FaultCode::OverVoltage;
        assert!(telemetry.has_fault());
    }

    #[test]
    fn test_read_f32_le() {
        let data = 3.14159f32.to_le_bytes();
        let mut offset = 0;
        let result = read_f32_le(&data, &mut offset).unwrap();
        assert!((result - 3.14159).abs() < 0.0001);
        assert_eq!(offset, 4);
    }

    #[test]
    fn test_read_f32_le_buffer_too_small() {
        let data = vec![0u8; 2];
        let mut offset = 0;
        let result = read_f32_le(&data, &mut offset);
        assert!(result.is_err());
    }

    #[test]
    fn test_read_i32_le() {
        let data = (-12345i32).to_le_bytes();
        let mut offset = 0;
        let result = read_i32_le(&data, &mut offset).unwrap();
        assert_eq!(result, -12345);
        assert_eq!(offset, 4);
    }

    #[test]
    fn test_parse_with_fault() {
        let mut payload = create_test_payload();
        // Modify fault code to OverTempFet (5)
        payload[72] = 5;

        let packet = DecodedPacket::new(Command::CommGetValues, payload);
        let telemetry = packet.parse_mc_values().unwrap();

        assert_eq!(telemetry.fault_code, FaultCode::OverTempFet);
        assert!(telemetry.fault_str.contains("MOSFET"));
        assert!(telemetry.has_fault());
    }

    use crate::vesc::protocol::Command;

    #[test]
    fn test_serialize_telemetry() {
        let telemetry = MotorTelemetry {
            v_in: 50.0,
            current_motor: 10.0,
            rpm: 1500,
            duty_cycle: 0.75,
            temp_mos: 45.0,
            temp_motor: 35.0,
            fault_code: FaultCode::None,
            fault_str: "No fault".to_string(),
            ..Default::default()
        };

        let json = serde_json::to_string(&telemetry).unwrap();
        assert!(json.contains("50.0") || json.contains("50"));
        assert!(json.contains("1500"));
        assert!(json.contains("No fault"));
    }
}
