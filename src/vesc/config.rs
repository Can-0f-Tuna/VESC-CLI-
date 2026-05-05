//! VESC Configuration Management
//!
//! Handles MC (Motor Controller) and APP (Application) configuration
//! read/write operations with JSON serialization.
//!
//! Note: Full binary parsing of VESC configuration is complex and varies
//! by firmware version. This module provides a JSON-based interface for
//! configuration management, with placeholder implementations for the
//! binary protocol that can be extended as needed.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Motor Controller Configuration
///
/// Contains all motor-specific parameters including limits, motor type,
/// FOC settings, sensor configuration, and advanced options.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(default)]
pub struct McConfiguration {
    /// Configuration limits
    pub limits: McLimits,
    /// Motor parameters
    pub motor: McMotor,
    /// FOC (Field-Oriented Control) settings
    pub foc: McFoc,
    /// Sensor configuration
    pub sensors: McSensors,
    /// Advanced settings
    pub advanced: McAdvanced,
}

/// MC Configuration Limits
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct McLimits {
    /// Motor current limit in Amperes
    pub current_limit: f32,
    /// Input/battery current limit in Amperes
    pub current_limit_in: f32,
    /// Minimum battery voltage (cutoff start)
    pub voltage_limit_min: f32,
    /// Maximum battery voltage (cutoff end)
    pub voltage_limit_max: f32,
    /// FET (MOSFET) temperature limit start (deg C)
    pub temp_limit_fet_start: f32,
    /// FET (MOSFET) temperature limit end (deg C)
    pub temp_limit_fet_end: f32,
    /// Motor temperature limit start (deg C)
    pub temp_limit_motor_start: f32,
    /// Motor temperature limit end (deg C)
    pub temp_limit_motor_end: f32,
}

impl Default for McLimits {
    fn default() -> Self {
        Self {
            current_limit: 60.0,
            current_limit_in: 40.0,
            voltage_limit_min: 8.0,
            voltage_limit_max: 50.4,
            temp_limit_fet_start: 80.0,
            temp_limit_fet_end: 100.0,
            temp_limit_motor_start: 80.0,
            temp_limit_motor_end: 100.0,
        }
    }
}

/// MC Motor Parameters
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct McMotor {
    /// Motor control type (FOC, BLDC, or DC)
    pub motor_type: MotorType,
    /// Number of motor pole pairs
    pub pole_pairs: u8,
    /// Flux linkage (Weber) - determined by motor detection
    pub flux_linkage: f32,
    /// Motor inductance (Henry) - determined by motor detection
    pub inductance: f32,
    /// Motor resistance (Ohm) - determined by motor detection
    pub resistance: f32,
}

impl Default for McMotor {
    fn default() -> Self {
        Self {
            motor_type: MotorType::Foc,
            pole_pairs: 7,
            flux_linkage: 0.0,
            inductance: 0.0,
            resistance: 0.0,
        }
    }
}

/// MC FOC Settings
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct McFoc {
    /// Observer gain for sensorless operation
    pub observer_gain: f32,
    /// Current controller proportional gain
    pub current_kp: f32,
    /// Current controller integral gain
    pub current_ki: f32,
}

impl Default for McFoc {
    fn default() -> Self {
        Self {
            observer_gain: 1.0e6,
            current_kp: 0.0, // Auto-calculated by default
            current_ki: 0.0, // Auto-calculated by default
        }
    }
}

/// MC Sensor Configuration
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct McSensors {
    /// Sensor mode for position feedback
    pub sensor_mode: SensorMode,
    /// Encoder resolution (counts per revolution)
    pub encoder_counts: u32,
}

impl Default for McSensors {
    fn default() -> Self {
        Self {
            sensor_mode: SensorMode::Sensorless,
            encoder_counts: 8192,
        }
    }
}

/// MC Advanced Settings
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct McAdvanced {
    /// PWM switching mode
    pub pwm_mode: PwmMode,
    /// Motor commutation mode
    pub comm_mode: CommMode,
    /// Additional custom parameters
    #[serde(flatten)]
    pub custom: HashMap<String, serde_json::Value>,
}

/// Motor Type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MotorType {
    /// Field-Oriented Control (default, recommended)
    #[default]
    Foc,
    /// BLDC trapezoidal control
    Bldc,
    /// Brushed DC motor
    Dc,
}

impl MotorType {
    /// Get human-readable description
    pub fn description(&self) -> &'static str {
        match self {
            MotorType::Foc => "Field-Oriented Control (smooth, efficient)",
            MotorType::Bldc => "BLDC Trapezoidal (traditional)",
            MotorType::Dc => "Brushed DC",
        }
    }
}

/// Sensor Mode
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SensorMode {
    /// Sensorless operation (default)
    #[default]
    Sensorless,
    /// Encoder feedback
    Encoder,
    /// Hall sensor feedback
    Hall,
    /// Combined Hall + Encoder
    HallEncoder,
}

impl SensorMode {
    /// Get human-readable description
    pub fn description(&self) -> &'static str {
        match self {
            SensorMode::Sensorless => "Sensorless (uses back-EMF)",
            SensorMode::Encoder => "Encoder (high precision)",
            SensorMode::Hall => "Hall sensors (simple)",
            SensorMode::HallEncoder => "Hall + Encoder (hybrid)",
        }
    }
}

/// PWM Mode
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PwmMode {
    /// Center-aligned PWM (default)
    #[default]
    Center,
    /// Edge-aligned PWM
    Edge,
    /// Advanced PWM with variable frequency
    Advanced,
}

/// Commutation Mode
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CommMode {
    /// Sinusoidal commutation (FOC)
    #[default]
    Sinusoidal,
    /// Trapezoidal commutation
    Trapezoidal,
}

/// Application Configuration
///
/// Contains all application-specific parameters including input sources,
/// throttle curves, safety settings, and communication options.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(default)]
pub struct AppConfiguration {
    /// Application type (PPM, ADC, UART, etc.)
    pub app_to_use: AppType,
    /// VESC controller ID (for CAN bus)
    pub controller_id: u8,
    /// PPM (Pulse Position Modulation) settings
    pub ppm: AppPpm,
    /// ADC (Analog-to-Digital Converter) settings
    pub adc: AppAdc,
    /// UART communication settings
    pub uart: AppUart,
    /// CAN bus settings
    pub can: AppCan,
    /// Nunchuk controller settings
    pub nunchuk: AppNunchuk,
    /// NRF (wireless) settings
    pub nrf: AppNrf,
}

/// PPM Input Settings
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct AppPpm {
    /// Control type mapping
    pub control_type: PpmControlType,
    /// Center pulse width in microseconds
    pub pulse_center: f32,
    /// Full range pulse width in microseconds
    pub pulse_width: f32,
    /// Start pulse width in microseconds (deadzone start)
    pub pulse_start: f32,
    /// Whether to use median filter for noise reduction
    pub median_filter: bool,
}

impl Default for AppPpm {
    fn default() -> Self {
        Self {
            control_type: PpmControlType::Current,
            pulse_center: 1500.0,
            pulse_width: 1000.0,
            pulse_start: 1000.0,
            median_filter: true,
        }
    }
}

/// ADC Input Settings
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct AppAdc {
    /// Control type mapping
    pub control_type: AdcControlType,
    /// Minimum voltage (maps to 0% input)
    pub voltage_min: f32,
    /// Maximum voltage (maps to 100% input)
    pub voltage_max: f32,
    /// Deadband at center position
    pub center_deadband: f32,
}

impl Default for AppAdc {
    fn default() -> Self {
        Self {
            control_type: AdcControlType::Current,
            voltage_min: 0.0,
            voltage_max: 3.3,
            center_deadband: 0.1,
        }
    }
}

/// UART Communication Settings
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct AppUart {
    /// Baud rate for serial communication
    pub baud_rate: u32,
}

impl Default for AppUart {
    fn default() -> Self {
        Self {
            baud_rate: 115200,
        }
    }
}

/// CAN Bus Settings
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct AppCan {
    /// Status message rate in Hz
    pub status_rate_hz: u16,
    /// CAN bus baud rate
    pub baud_rate: CanBaudRate,
}

impl Default for AppCan {
    fn default() -> Self {
        Self {
            status_rate_hz: 50,
            baud_rate: CanBaudRate::Can500k,
        }
    }
}

/// Nunchuk Controller Settings
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct AppNunchuk {
    /// Control type mapping
    pub control_type: NunchukControlType,
    /// Whether to use the Z button as brake
    pub z_button_brake: bool,
    /// Whether to use the C button as brake
    pub c_button_brake: bool,
}

impl Default for AppNunchuk {
    fn default() -> Self {
        Self {
            control_type: NunchukControlType::Current,
            z_button_brake: true,
            c_button_brake: false,
        }
    }
}

/// NRF (Wireless) Settings
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct AppNrf {
    /// Enable NRF communication
    pub enabled: bool,
    /// Radio channel (0-125, corresponds to 2400-2525 MHz)
    pub channel: u8,
    /// Data rate
    pub data_rate: NrfDataRate,
}

impl Default for AppNrf {
    fn default() -> Self {
        Self {
            enabled: false,
            channel: 76, // Default VESC channel (2476 MHz)
            data_rate: NrfDataRate::2Mbps,
        }
    }
}

/// Application Type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AppType {
    /// No application (disabled)
    #[default]
    None,
    /// PPM input
    Ppm,
    /// ADC input
    Adc,
    /// ADC + UART combo
    AdcUart,
    /// UART only
    Uart,
    /// PPM + UART combo
    PpmUart,
    /// ADC + PPM + UART combo
    AdcPpmUart,
    /// Nunchuk controller
    Nunchuk,
    /// NRF wireless
    Nrf,
    /// Custom application
    Custom,
}

impl AppType {
    /// Get human-readable description
    pub fn description(&self) -> &'static str {
        match self {
            AppType::None => "No application (disabled)",
            AppType::Ppm => "PPM (RC receiver)",
            AppType::Adc => "ADC (analog input)",
            AppType::AdcUart => "ADC + UART (analog with telemetry)",
            AppType::Uart => "UART (serial control)",
            AppType::PpmUart => "PPM + UART (RC with telemetry)",
            AppType::AdcPpmUart => "ADC + PPM + UART (multi-input)",
            AppType::Nunchuk => "Nunchuk controller",
            AppType::Nrf => "NRF wireless",
            AppType::Custom => "Custom application",
        }
    }

    /// Check if this app type uses PPM input
    pub fn uses_ppm(&self) -> bool {
        matches!(self, AppType::Ppm | AppType::PpmUart | AppType::AdcPpmUart)
    }

    /// Check if this app type uses ADC input
    pub fn uses_adc(&self) -> bool {
        matches!(self, AppType::Adc | AppType::AdcUart | AppType::AdcPpmUart)
    }

    /// Check if this app type uses UART
    pub fn uses_uart(&self) -> bool {
        matches!(self, AppType::Uart | AppType::AdcUart | AppType::PpmUart | AppType::AdcPpmUart)
    }
}

/// PPM Control Type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PpmControlType {
    /// Duty cycle control (0% to 100%)
    #[default]
    Duty,
    /// Current control (Amps)
    Current,
    /// Current with brake
    CurrentBrake,
    /// RPM control
    Rpm,
    /// Position control
    Position,
}

/// ADC Control Type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AdcControlType {
    /// Duty cycle control
    #[default]
    Duty,
    /// Current control
    Current,
    /// Current with brake
    CurrentBrake,
    /// RPM control
    Rpm,
}

/// Nunchuk Control Type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NunchukControlType {
    /// Current control
    #[default]
    Current,
    /// Current with brake
    CurrentBrake,
    /// RPM control
    Rpm,
}

/// CAN Baud Rate
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CanBaudRate {
    /// 125 kbps
    Can125k,
    /// 250 kbps
    Can250k,
    /// 500 kbps (default)
    #[default]
    Can500k,
    /// 1 Mbps
    Can1m,
}

/// NRF Data Rate
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NrfDataRate {
    /// 250 kbps
    Kbps250,
    /// 1 Mbps
    Kbps1,
    /// 2 Mbps (default)
    #[default]
    Mbps2,
}

/// Configuration set (both MC and APP)
///
/// This structure represents a complete backup of both MC and APP
/// configurations, suitable for saving and restoring.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ConfigSet {
    /// Motor controller configuration
    pub mc: McConfiguration,
    /// Application configuration
    pub app: AppConfiguration,
    /// Schema version for compatibility
    pub schema_version: String,
    /// Backup creation timestamp (RFC 3339)
    pub timestamp: String,
    /// Tool version that created this backup
    pub tool_version: String,
    /// Optional notes/description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

impl ConfigSet {
    /// Create a new configuration set with current timestamp
    pub fn new(mc: McConfiguration, app: AppConfiguration) -> Self {
        Self {
            mc,
            app,
            schema_version: "1.0".to_string(),
            timestamp: chrono::Local::now().to_rfc3339(),
            tool_version: env!("CARGO_PKG_VERSION").to_string(),
            notes: None,
        }
    }

    /// Create a new configuration set with notes
    pub fn with_notes(mc: McConfiguration, app: AppConfiguration, notes: &str) -> Self {
        let mut config = Self::new(mc, app);
        config.notes = Some(notes.to_string());
        config
    }

    /// Serialize to JSON string (pretty-printed)
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Serialize to JSON bytes
    pub fn to_json_bytes(&self) -> Result<Vec<u8>, serde_json::Error> {
        serde_json::to_vec_pretty(self)
    }

    /// Deserialize from JSON string
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    /// Deserialize from JSON bytes
    pub fn from_json_bytes(bytes: &[u8]) -> Result<Self, serde_json::Error> {
        serde_json::from_slice(bytes)
    }

    /// Validate the configuration set
    ///
    /// Returns a list of validation errors, or empty list if valid
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        // Validate MC configuration
        errors.extend(self.mc.validate());

        // Validate APP configuration
        errors.extend(self.app.validate());

        errors
    }
}

impl McConfiguration {
    /// Serialize to JSON string
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Serialize to JSON bytes
    pub fn to_json_bytes(&self) -> Result<Vec<u8>, serde_json::Error> {
        serde_json::to_vec_pretty(self)
    }

    /// Deserialize from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    /// Deserialize from JSON bytes
    pub fn from_json_bytes(bytes: &[u8]) -> Result<Self, serde_json::Error> {
        serde_json::from_slice(bytes)
    }

    /// Validate configuration
    ///
    /// Returns a list of validation error messages, or empty if valid
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        // Validate limits
        if self.limits.current_limit <= 0.0 {
            errors.push("MC: Current limit must be positive".to_string());
        }
        if self.limits.current_limit > 300.0 {
            errors.push("MC: Current limit seems excessively high (>300A)".to_string());
        }

        if self.limits.voltage_limit_min >= self.limits.voltage_limit_max {
            errors.push("MC: Min voltage must be less than max voltage".to_string());
        }

        if self.limits.voltage_limit_min < 4.0 {
            errors.push("MC: Min voltage below 4V may damage batteries".to_string());
        }

        if self.limits.temp_limit_fet_start >= self.limits.temp_limit_fet_end {
            errors.push("MC: FET start temp must be less than end temp".to_string());
        }

        if self.limits.temp_limit_motor_start >= self.limits.temp_limit_motor_end {
            errors.push("MC: Motor start temp must be less than end temp".to_string());
        }

        // Validate motor parameters
        if self.motor.pole_pairs == 0 {
            errors.push("MC: Pole pairs cannot be zero".to_string());
        }

        // Validate FOC parameters
        if self.foc.observer_gain <= 0.0 {
            errors.push("MC: Observer gain must be positive".to_string());
        }

        errors
    }

    /// Check if motor detection has been performed
    ///
    /// Returns true if flux_linkage, inductance, and resistance are non-zero
    pub fn is_motor_detected(&self) -> bool {
        self.motor.flux_linkage > 0.0 && self.motor.inductance > 0.0 && self.motor.resistance > 0.0
    }
}

impl AppConfiguration {
    /// Serialize to JSON string
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Serialize to JSON bytes
    pub fn to_json_bytes(&self) -> Result<Vec<u8>, serde_json::Error> {
        serde_json::to_vec_pretty(self)
    }

    /// Deserialize from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    /// Deserialize from JSON bytes
    pub fn from_json_bytes(bytes: &[u8]) -> Result<Self, serde_json::Error> {
        serde_json::from_slice(bytes)
    }

    /// Validate configuration
    ///
    /// Returns a list of validation error messages, or empty if valid
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        // Validate PPM settings
        if self.app_to_use.uses_ppm() {
            if self.ppm.pulse_width <= 0.0 {
                errors.push("APP: PPM pulse width must be positive".to_string());
            }
            if self.ppm.pulse_center <= 0.0 {
                errors.push("APP: PPM pulse center must be positive".to_string());
            }
        }

        // Validate ADC settings
        if self.app_to_use.uses_adc() {
            if self.adc.voltage_max <= self.adc.voltage_min {
                errors.push("APP: ADC max voltage must be greater than min voltage".to_string());
            }
            if self.adc.center_deadband < 0.0 || self.adc.center_deadband > 1.0 {
                errors.push("APP: ADC center deadband must be between 0.0 and 1.0".to_string());
            }
        }

        // Validate UART settings
        if self.app_to_use.uses_uart() {
            // Common baud rates
            let valid_bauds = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];
            if !valid_bauds.contains(&self.uart.baud_rate) {
                errors.push(format!(
                    "APP: UART baud rate {} is non-standard",
                    self.uart.baud_rate
                ));
            }
        }

        // Validate CAN settings
        if self.can.status_rate_hz == 0 || self.can.status_rate_hz > 1000 {
            errors.push("APP: CAN status rate should be between 1 and 1000 Hz".to_string());
        }

        errors
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mc_configuration_default() {
        let config = McConfiguration::default();
        assert!(config.limits.current_limit > 0.0);
        assert_eq!(config.motor.motor_type, MotorType::Foc);
        assert_eq!(config.motor.pole_pairs, 7);
    }

    #[test]
    fn test_mc_configuration_json_roundtrip() {
        let original = McConfiguration::default();
        let json = original.to_json().unwrap();
        let restored = McConfiguration::from_json(&json).unwrap();
        assert_eq!(original, restored);
    }

    #[test]
    fn test_mc_configuration_validation() {
        let mut config = McConfiguration::default();

        // Valid default should pass
        let errors = config.validate();
        assert!(errors.is_empty(), "Default config should be valid: {:?}", errors);

        // Invalid current limit
        config.limits.current_limit = -10.0;
        let errors = config.validate();
        assert!(errors.iter().any(|e| e.contains("Current limit")));

        // Invalid voltage limits
        config.limits.current_limit = 60.0; // Restore valid value
        config.limits.voltage_limit_min = 50.0;
        config.limits.voltage_limit_max = 40.0;
        let errors = config.validate();
        assert!(errors.iter().any(|e| e.contains("voltage")));
    }

    #[test]
    fn test_app_configuration_default() {
        let config = AppConfiguration::default();
        assert_eq!(config.app_to_use, AppType::None);
        assert_eq!(config.controller_id, 0);
        assert_eq!(config.uart.baud_rate, 115200);
    }

    #[test]
    fn test_app_configuration_json_roundtrip() {
        let original = AppConfiguration::default();
        let json = original.to_json().unwrap();
        let restored = AppConfiguration::from_json(&json).unwrap();
        assert_eq!(original, restored);
    }

    #[test]
    fn test_app_configuration_validation() {
        let mut config = AppConfiguration::default();

        // Valid default should pass
        let errors = config.validate();
        assert!(errors.is_empty());

        // Invalid ADC settings when ADC is enabled
        config.app_to_use = AppType::Adc;
        config.adc.voltage_max = 0.0;
        let errors = config.validate();
        assert!(errors.iter().any(|e| e.contains("ADC")));
    }

    #[test]
    fn test_config_set() {
        let mc = McConfiguration::default();
        let app = AppConfiguration::default();
        let config_set = ConfigSet::new(mc, app);

        assert_eq!(config_set.schema_version, "1.0");
        assert!(!config_set.timestamp.is_empty());
        assert!(!config_set.tool_version.is_empty());
    }

    #[test]
    fn test_config_set_json_roundtrip() {
        let mc = McConfiguration::default();
        let app = AppConfiguration::default();
        let original = ConfigSet::new(mc, app);

        let json = original.to_json().unwrap();
        let restored = ConfigSet::from_json(&json).unwrap();

        assert_eq!(original.mc, restored.mc);
        assert_eq!(original.app, restored.app);
        assert_eq!(original.schema_version, restored.schema_version);
    }

    #[test]
    fn test_motor_type_descriptions() {
        assert!(MotorType::Foc.description().contains("Field-Oriented"));
        assert!(MotorType::Bldc.description().contains("BLDC"));
        assert!(MotorType::Dc.description().contains("DC"));
    }

    #[test]
    fn test_sensor_mode_descriptions() {
        assert!(SensorMode::Sensorless.description().contains("back-EMF"));
        assert!(SensorMode::Encoder.description().contains("high precision"));
    }

    #[test]
    fn test_app_type_helpers() {
        assert!(AppType::Ppm.uses_ppm());
        assert!(AppType::Adc.uses_adc());
        assert!(AppType::Uart.uses_uart());

        assert!(AppType::PpmUart.uses_ppm());
        assert!(AppType::PpmUart.uses_uart());

        assert!(!AppType::Ppm.uses_adc());
        assert!(!AppType::Adc.uses_ppm());
    }

    #[test]
    fn test_is_motor_detected() {
        let mut config = McConfiguration::default();
        assert!(!config.is_motor_detected());

        config.motor.flux_linkage = 0.001;
        config.motor.inductance = 0.0001;
        config.motor.resistance = 0.05;
        assert!(config.is_motor_detected());
    }

    #[test]
    fn test_config_set_with_notes() {
        let mc = McConfiguration::default();
        let app = AppConfiguration::default();
        let config_set = ConfigSet::with_notes(mc, app, "Test backup");

        assert_eq!(config_set.notes, Some("Test backup".to_string()));
    }

    #[test]
    fn test_motor_type_serde() {
        let mt = MotorType::Foc;
        let json = serde_json::to_string(&mt).unwrap();
        assert_eq!(json, "\"foc\"");

        let restored: MotorType = serde_json::from_str(&json).unwrap();
        assert_eq!(mt, restored);
    }

    #[test]
    fn test_app_type_serde() {
        let at = AppType::AdcUart;
        let json = serde_json::to_string(&at).unwrap();
        assert_eq!(json, "\"adc_uart\"");

        let restored: AppType = serde_json::from_str(&json).unwrap();
        assert_eq!(at, restored);
    }

    #[test]
    fn test_config_set_validation() {
        let mut mc = McConfiguration::default();
        let app = AppConfiguration::default();

        // Invalid MC config
        mc.limits.current_limit = -1.0;

        let config_set = ConfigSet::new(mc, app);
        let errors = config_set.validate();

        assert!(!errors.is_empty());
        assert!(errors.iter().any(|e| e.contains("MC")));
    }
}
