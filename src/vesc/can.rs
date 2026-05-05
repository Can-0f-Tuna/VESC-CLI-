//! CAN Bus Operations
//!
//! Support for multi-VESC CAN networks allowing communication with
//! multiple VESCs over a single CAN bus connection.

use crate::vesc::connection::ConnectionError;
use crate::vesc::protocol::{encode_packet, decode_packet, Command, ProtocolError, DecodedPacket};
use serde::Serialize;
use tokio::time::{timeout, Duration};

/// CAN ID for targeted VESC (valid range: 1-253)
/// 
/// CAN ID 0 is reserved for broadcast messages.
/// CAN ID 254 is reserved for the master/forwarder.
/// CAN ID 255 is reserved for firmware updates.
pub type CanId = u8;

/// Minimum valid CAN ID (1)
pub const CAN_ID_MIN: CanId = 1;
/// Maximum valid CAN ID (253)
pub const CAN_ID_MAX: CanId = 253;
/// Broadcast CAN ID (0)
pub const CAN_ID_BROADCAST: CanId = 0;
/// Master/Forwarder CAN ID (254)
pub const CAN_ID_MASTER: CanId = 254;

/// CAN bus status information
#[derive(Debug, Clone, Serialize)]
pub struct CanStatus {
    /// CAN ID of the target VESC
    pub can_id: CanId,
    /// Whether the VESC is active/responsive
    pub active: bool,
    /// Error counters (Transmit Error Count, Receive Error Count)
    pub error_counters: (u8, u8),
    /// Last seen timestamp (if available)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_seen_ms: Option<u64>,
}

impl CanStatus {
    /// Create a new CAN status for an active VESC
    pub fn active(can_id: CanId) -> Self {
        Self {
            can_id,
            active: true,
            error_counters: (0, 0),
            last_seen_ms: Some(0),
        }
    }

    /// Create a new CAN status for an inactive VESC
    pub fn inactive(can_id: CanId) -> Self {
        Self {
            can_id,
            active: false,
            error_counters: (0, 0),
            last_seen_ms: None,
        }
    }

    /// Check if the CAN ID is valid
    pub fn is_valid_can_id(&self) -> bool {
        is_valid_can_id(self.can_id)
    }
}

/// Check if a CAN ID is valid for targeting
///
/// Valid IDs: 1-253 (excluding 0, 254, 255)
pub fn is_valid_can_id(id: CanId) -> bool {
    id >= CAN_ID_MIN && id <= CAN_ID_MAX
}

/// Validate a CAN ID and return an error if invalid
pub fn validate_can_id(id: CanId) -> Result<(), ConnectionError> {
    if is_valid_can_id(id) {
        Ok(())
    } else {
        Err(ConnectionError::Protocol(ProtocolError::InvalidArgument(
            format!("Invalid CAN ID: {}. Valid range: {}-{}", id, CAN_ID_MIN, CAN_ID_MAX)
        )))
    }
}

/// Build a CAN forward packet payload
///
/// Format: [target_id:u8] [original_command:u8] [original_payload...]
fn build_can_forward_payload(target_id: CanId, command: Command, payload: Option<&[u8]>) -> Vec<u8> {
    let mut data = Vec::with_capacity(2 + payload.map_or(0, |p| p.len()));
    data.push(target_id);
    data.push(command.to_u8());
    if let Some(p) = payload {
        data.extend_from_slice(p);
    }
    data
}

/// CAN forward command variant
///
/// These are the commands that can be forwarded to another VESC on the CAN bus.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CanForwardCommand {
    /// Set duty cycle
    SetDuty,
    /// Set current
    SetCurrent,
    /// Set current brake
    SetCurrentBrake,
    /// Set RPM
    SetRpm,
    /// Set position
    SetPos,
    /// Set handbrake
    SetHandbrake,
    /// Get values (telemetry)
    GetValues,
    /// Reboot
    Reboot,
    /// Alive ping
    Alive,
}

impl CanForwardCommand {
    /// Convert to protocol Command
    pub fn to_command(self) -> Command {
        match self {
            CanForwardCommand::SetDuty => Command::CommSetDuty,
            CanForwardCommand::SetCurrent => Command::CommSetCurrent,
            CanForwardCommand::SetCurrentBrake => Command::CommSetCurrentBrake,
            CanForwardCommand::SetRpm => Command::CommSetRpm,
            CanForwardCommand::SetPos => Command::CommSetPos,
            CanForwardCommand::SetHandbrake => Command::CommSetHandbrake,
            CanForwardCommand::GetValues => Command::CommGetValues,
            CanForwardCommand::Reboot => Command::CommReboot,
            CanForwardCommand::Alive => Command::CommAlive,
        }
    }

    /// Get human-readable description
    pub fn description(&self) -> &'static str {
        match self {
            CanForwardCommand::SetDuty => "Set duty cycle",
            CanForwardCommand::SetCurrent => "Set motor current",
            CanForwardCommand::SetCurrentBrake => "Apply current brake",
            CanForwardCommand::SetRpm => "Set motor RPM",
            CanForwardCommand::SetPos => "Set motor position",
            CanForwardCommand::SetHandbrake => "Set handbrake",
            CanForwardCommand::GetValues => "Get telemetry values",
            CanForwardCommand::Reboot => "Reboot VESC",
            CanForwardCommand::Alive => "Send keep-alive",
        }
    }
}

/// CAN bus manager for multi-VESC networks
pub struct CanBus {
    /// Local CAN ID (this VESC's ID)
    pub local_id: CanId,
    /// Scan timeout for detecting VESCs
    scan_timeout: Duration,
}

impl CanBus {
    /// Create a new CAN bus manager
    pub fn new(local_id: CanId) -> Result<Self, ConnectionError> {
        validate_can_id(local_id)?;
        Ok(Self {
            local_id,
            scan_timeout: Duration::from_millis(500),
        })
    }

    /// Set the scan timeout
    pub fn set_scan_timeout(&mut self, timeout: Duration) {
        self.scan_timeout = timeout;
    }

    /// Get the scan timeout
    pub fn scan_timeout(&self) -> Duration {
        self.scan_timeout
    }
}

/// Build payload for duty cycle command
fn build_duty_payload(duty: f32) -> Vec<u8> {
    let value = (duty * 100_000.0) as i32;
    value.to_be_bytes().to_vec()
}

/// Build payload for current command
fn build_current_payload(current: f32) -> Vec<u8> {
    let value = (current * 1000.0) as i32;
    value.to_be_bytes().to_vec()
}

/// Build payload for RPM command
fn build_rpm_payload(rpm: i32) -> Vec<u8> {
    rpm.to_be_bytes().to_vec()
}

/// Build payload for position command
fn build_position_payload(pos: f32) -> Vec<u8> {
    let value = (pos * 1_000_000.0) as i32;
    value.to_be_bytes().to_vec()
}

/// Build the appropriate payload for a CAN forward command
pub fn build_can_forward_command_payload(
    command: CanForwardCommand,
    value: Option<f32>,
) -> Option<Vec<u8>> {
    match command {
        CanForwardCommand::SetDuty => {
            value.map(|v| build_duty_payload(v.clamp(-1.0, 1.0)))
        }
        CanForwardCommand::SetCurrent => {
            value.map(|v| build_current_payload(v))
        }
        CanForwardCommand::SetCurrentBrake => {
            value.map(|v| build_current_payload(v.max(0.0)))
        }
        CanForwardCommand::SetRpm => {
            value.map(|v| build_rpm_payload(v as i32))
        }
        CanForwardCommand::SetPos => {
            value.map(|v| build_position_payload(v))
        }
        CanForwardCommand::SetHandbrake => {
            value.map(|v| build_current_payload(v.max(0.0)))
        }
        CanForwardCommand::GetValues |
        CanForwardCommand::Reboot |
        CanForwardCommand::Alive => {
            None
        }
    }
}

/// Get all valid CAN IDs (1-253)
pub fn valid_can_ids() -> Vec<CanId> {
    (CAN_ID_MIN..=CAN_ID_MAX).collect()
}

/// Get CAN ID description
pub fn can_id_description(id: CanId) -> &'static str {
    match id {
        0 => "Broadcast",
        1..=253 => "Standard node ID",
        254 => "Master/Forwarder",
        255 => "Firmware update",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_can_id_validation() {
        assert!(is_valid_can_id(1));
        assert!(is_valid_can_id(100));
        assert!(is_valid_can_id(253));
        
        assert!(!is_valid_can_id(0));   // Broadcast
        assert!(!is_valid_can_id(254)); // Master
        assert!(!is_valid_can_id(255)); // Firmware update
    }

    #[test]
    fn test_validate_can_id() {
        assert!(validate_can_id(1).is_ok());
        assert!(validate_can_id(253).is_ok());
        assert!(validate_can_id(0).is_err());
        assert!(validate_can_id(255).is_err());
    }

    #[test]
    fn test_can_forward_command_conversion() {
        assert_eq!(CanForwardCommand::SetDuty.to_command(), Command::CommSetDuty);
        assert_eq!(CanForwardCommand::SetRpm.to_command(), Command::CommSetRpm);
        assert_eq!(CanForwardCommand::GetValues.to_command(), Command::CommGetValues);
    }

    #[test]
    fn test_build_can_forward_payload() {
        let payload = build_can_forward_payload(5, Command::CommSetDuty, Some(&[0x01, 0x02]));
        assert_eq!(payload, vec![5, 5, 0x01, 0x02]); // target_id=5, cmd=CommSetDuty(5)
        
        let payload = build_can_forward_payload(10, Command::CommGetValues, None);
        assert_eq!(payload, vec![10, 4]); // target_id=10, cmd=CommGetValues(4)
    }

    #[test]
    fn test_build_duty_payload() {
        let payload = build_duty_payload(0.5);
        assert_eq!(payload.len(), 4);
        // 0.5 * 100000 = 50000 = 0x0000C350
        assert_eq!(&payload, &[0x00, 0x00, 0xC3, 0x50]);
    }

    #[test]
    fn test_build_current_payload() {
        let payload = build_current_payload(10.0);
        assert_eq!(payload.len(), 4);
        // 10.0 * 1000 = 10000 = 0x00002710
        assert_eq!(&payload, &[0x00, 0x00, 0x27, 0x10]);
    }

    #[test]
    fn test_build_rpm_payload() {
        let payload = build_rpm_payload(1500);
        assert_eq!(payload.len(), 4);
        // 1500 = 0x000005DC
        assert_eq!(&payload, &[0x00, 0x00, 0x05, 0xDC]);
    }

    #[test]
    fn test_can_status() {
        let status = CanStatus::active(5);
        assert_eq!(status.can_id, 5);
        assert!(status.active);
        assert!(status.is_valid_can_id());
        
        let status = CanStatus::inactive(0);
        assert!(!status.is_valid_can_id());
    }

    #[test]
    fn test_valid_can_ids() {
        let ids = valid_can_ids();
        assert_eq!(ids.len(), 253);
        assert_eq!(ids[0], 1);
        assert_eq!(ids[252], 253);
    }

    #[test]
    fn test_can_bus_new() {
        let can = CanBus::new(1);
        assert!(can.is_ok());
        
        let can = CanBus::new(0);
        assert!(can.is_err());
    }

    #[test]
    fn test_build_can_forward_command_payload() {
        // Commands with values
        assert!(build_can_forward_command_payload(CanForwardCommand::SetDuty, Some(0.5)).is_some());
        assert!(build_can_forward_command_payload(CanForwardCommand::SetCurrent, Some(10.0)).is_some());
        assert!(build_can_forward_command_payload(CanForwardCommand::SetRpm, Some(1000.0)).is_some());
        
        // Commands without values
        assert!(build_can_forward_command_payload(CanForwardCommand::GetValues, None).is_none());
        assert!(build_can_forward_command_payload(CanForwardCommand::Alive, None).is_none());
    }
}
