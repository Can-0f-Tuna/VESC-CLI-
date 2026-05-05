//! VESC Communication Module
//!
//! This module handles all VESC protocol communication including
//! packet framing, command construction, and response parsing.

pub mod can;
pub mod commands;
pub mod config;
pub mod connection;
pub mod protocol;
pub mod telemetry;

// Re-export commonly used items
pub use can::{
    CanBus, CanStatus, CanId, CanForwardCommand,
    is_valid_can_id, validate_can_id,
    CAN_ID_MIN, CAN_ID_MAX, CAN_ID_BROADCAST, CAN_ID_MASTER,
    valid_can_ids, can_id_description,
    build_can_forward_command_payload,
};
pub use commands::{VescCommand, VescClient, FirmwareVersion};
pub use connection::{
    VescConnection, 
    ConnectionError, 
    FirmwareInfo, 
    PortInfo,
    list_ports, 
    auto_detect_port,
    auto_detect_port_with_timeout,
    DEFAULT_BAUD_RATE, 
    DEFAULT_TIMEOUT
};
pub use protocol::{
    Command, 
    ProtocolError, 
    DecodedPacket,
    FirmwareVersion as ProtocolFirmwareVersion,
    encode_packet, 
    decode_packet,
    calculate_crc,
    find_packet_start,
    expected_packet_size,
    has_complete_packet,
    PacketBuffer,
    START_BYTE_SHORT,
    START_BYTE_LONG,
    STOP_BYTE,
    MAX_PAYLOAD_LEN,
    MAX_PACKET_SIZE,
};
pub use telemetry::{MotorTelemetry, FaultCode};
pub use config::{
    McConfiguration, AppConfiguration, ConfigSet,
    McLimits, McMotor, McFoc, McSensors, McAdvanced,
    AppPpm, AppAdc, AppUart, AppCan, AppNunchuk, AppNrf,
    MotorType, SensorMode, PwmMode, CommMode,
    AppType, PpmControlType, AdcControlType, NunchukControlType,
    CanBaudRate, NrfDataRate,
};
