//! VESC Binary Protocol Implementation
//!
//! Implements packet framing, CRC16, and command encoding/decoding
//! per the VESC communication specification.
//!
//! Protocol format:
//! - Short packet: [0x02] [len:u8] [payload] [CRC16:u16 BE] [0x03]
//! - Long packet:  [0x03] [len:u16 BE] [payload] [CRC16:u16 BE] [0x03]

use thiserror::Error;
use serde::Serialize;

/// Start byte for short packets (payload length ≤ 255 bytes)
pub const START_BYTE_SHORT: u8 = 0x02;
/// Start byte for long packets (payload length > 255 bytes)
pub const START_BYTE_LONG: u8 = 0x03;
/// Stop byte marking end of packet
pub const STOP_BYTE: u8 = 0x03;
/// Maximum payload length (u16 max)
pub const MAX_PAYLOAD_LEN: usize = 65535;
/// Maximum packet buffer size (worst case: start + 2-byte len + payload + CRC + stop)
pub const MAX_PACKET_SIZE: usize = 65538;

/// Command IDs for VESC communication
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Command {
    /// Get firmware version (0)
    CommFwVersion = 0,
    /// Jump to bootloader (1)
    CommJumpToBootloader = 1,
    /// Erase new app (2)
    CommEraseNewApp = 2,
    /// Write new app data (3)
    CommWriteNewAppData = 3,
    /// Get values - telemetry data (4)
    CommGetValues = 4,
    /// Set duty cycle (5)
    CommSetDuty = 5,
    /// Set current (6)
    CommSetCurrent = 6,
    /// Set current brake (7)
    CommSetCurrentBrake = 7,
    /// Set RPM (8)
    CommSetRpm = 8,
    /// Set position (9)
    CommSetPos = 9,
    /// Set handbrake (10)
    CommSetHandbrake = 10,
    /// Set detect (11)
    CommSetDetect = 11,
    /// Set servo position (12)
    CommSetServoPos = 12,
    /// Set motor controller configuration (13)
    CommSetMcConf = 13,
    /// Get motor controller configuration (14)
    CommGetMcConf = 14,
    /// Get motor controller default configuration (15)
    CommGetMcConfDefault = 15,
    /// Set application configuration (16)
    CommSetAppConf = 16,
    /// Get application configuration (17)
    CommGetAppConf = 17,
    /// Get application default configuration (18)
    CommGetAppConfDefault = 18,
    /// Sample print (19)
    CommSamplePrint = 19,
    /// Terminal command (20)
    CommTerminalCmd = 20,
    /// Print message (21)
    CommPrint = 21,
    /// Get rotor position (22)
    CommRotorPosition = 22,
    /// Experiment sample (23)
    CommExperimentSample = 23,
    /// Detect motor parameters (24)
    CommDetectMotorParam = 24,
    /// Detect motor R and L (25)
    CommDetectMotorR_L = 25,
    /// Detect motor flux linkage (26)
    CommDetectMotorFluxLinkage = 26,
    /// Detect encoder (27)
    CommDetectEncoder = 27,
    /// Detect hall FOC (28)
    CommDetectHallFoc = 28,
    /// Reboot controller (29)
    CommReboot = 29,
    /// Keep-alive signal (30)
    CommAlive = 30,
    /// Get decoded PPM signal (31)
    CommGetDecodedPpm = 31,
    /// Get decoded ADC signal (32)
    CommGetDecodedAdc = 32,
    /// Get decoded CHUCK (Nunchuk) signal (33)
    CommGetDecodedChuk = 33,
    /// Forward CAN message (34)
    CommForwardCan = 34,
    /// Set chuck data (35)
    CommSetChuckData = 35,
    /// Custom application data (36)
    CommCustomAppData = 36,
    /// NRF start pairing (37)
    CommNrfStartPairing = 37,
    /// NRF set MAC address (38)
    CommNrfSetMacAddr = 38,
    /// NRF set encryption key (39)
    CommNrfSetEncKey = 39,
    /// NRF set radio channel (40)
    CommNrfSetRadioChannel = 40,
    /// NRF pairing started (41)
    CommNrfPairingStarted = 41,
    /// NRF pairing OK (42)
    CommNrfPairingOk = 42,
    /// NRF pairing failed (43)
    CommNrfPairingFailed = 43,
    /// IMU calibration (44)
    CommImuCalibrate = 44,
    /// Lisp set running (45)
    CommLispSetRunning = 45,
    /// Lisp get stats (46)
    CommLispGetStats = 46,
    /// Lisp reload (47)
    CommLispReload = 47,
    /// Get IMU calibration data (48)
    CommGetImuCalibration = 48,
    /// Get IMU calibration data 6-point (49)
    CommGetImuCalibration6 = 49,
    /// Get IMU calibration data 9-point (50)
    CommGetImuCalibration9 = 50,
    /// Lisp read code (51)
    CommLispRead = 51,
    /// Lisp write code (52)
    CommLispWrite = 52,
    /// Lisp erase code (53)
    CommLispErase = 53,
    /// Lisp REPL command (54)
    CommLispReplCmd = 54,
    /// Lisp stream code (55)
    CommLispStreamCode = 55,
    /// Get GNSS data (56)
    CommGetGnss = 56,
    /// Log data F32 (57)
    CommLogDataF32 = 57,
}

impl Command {
    /// Convert command to u8
    pub fn to_u8(self) -> u8 {
        self as u8
    }

    /// Try to convert u8 to Command
    pub fn from_u8(value: u8) -> Option<Self> {
        match value {
            0 => Some(Command::CommFwVersion),
            1 => Some(Command::CommJumpToBootloader),
            2 => Some(Command::CommEraseNewApp),
            3 => Some(Command::CommWriteNewAppData),
            4 => Some(Command::CommGetValues),
            5 => Some(Command::CommSetDuty),
            6 => Some(Command::CommSetCurrent),
            7 => Some(Command::CommSetCurrentBrake),
            8 => Some(Command::CommSetRpm),
            9 => Some(Command::CommSetPos),
            10 => Some(Command::CommSetHandbrake),
            11 => Some(Command::CommSetDetect),
            12 => Some(Command::CommSetServoPos),
            13 => Some(Command::CommSetMcConf),
            14 => Some(Command::CommGetMcConf),
            15 => Some(Command::CommGetMcConfDefault),
            16 => Some(Command::CommSetAppConf),
            17 => Some(Command::CommGetAppConf),
            18 => Some(Command::CommGetAppConfDefault),
            19 => Some(Command::CommSamplePrint),
            20 => Some(Command::CommTerminalCmd),
            21 => Some(Command::CommPrint),
            22 => Some(Command::CommRotorPosition),
            23 => Some(Command::CommExperimentSample),
            24 => Some(Command::CommDetectMotorParam),
            25 => Some(Command::CommDetectMotorR_L),
            26 => Some(Command::CommDetectMotorFluxLinkage),
            27 => Some(Command::CommDetectEncoder),
            28 => Some(Command::CommDetectHallFoc),
            29 => Some(Command::CommReboot),
            30 => Some(Command::CommAlive),
            31 => Some(Command::CommGetDecodedPpm),
            32 => Some(Command::CommGetDecodedAdc),
            33 => Some(Command::CommGetDecodedChuk),
            34 => Some(Command::CommForwardCan),
            35 => Some(Command::CommSetChuckData),
            36 => Some(Command::CommCustomAppData),
            37 => Some(Command::CommNrfStartPairing),
            38 => Some(Command::CommNrfSetMacAddr),
            39 => Some(Command::CommNrfSetEncKey),
            40 => Some(Command::CommNrfSetRadioChannel),
            41 => Some(Command::CommNrfPairingStarted),
            42 => Some(Command::CommNrfPairingOk),
            43 => Some(Command::CommNrfPairingFailed),
            44 => Some(Command::CommImuCalibrate),
            45 => Some(Command::CommLispSetRunning),
            46 => Some(Command::CommLispGetStats),
            47 => Some(Command::CommLispReload),
            48 => Some(Command::CommGetImuCalibration),
            49 => Some(Command::CommGetImuCalibration6),
            50 => Some(Command::CommGetImuCalibration9),
            51 => Some(Command::CommLispRead),
            52 => Some(Command::CommLispWrite),
            53 => Some(Command::CommLispErase),
            54 => Some(Command::CommLispReplCmd),
            55 => Some(Command::CommLispStreamCode),
            56 => Some(Command::CommGetGnss),
            57 => Some(Command::CommLogDataF32),
            _ => None,
        }
    }
}

/// Packet framing error types
#[derive(Error, Debug, Clone, PartialEq)]
pub enum ProtocolError {
    #[error("Invalid start byte: expected 0x02 or 0x03, got {0:02x}")]
    InvalidStartByte(u8),
    #[error("Invalid stop byte: expected 0x03, got {0:02x}")]
    InvalidStopByte(u8),
    #[error("CRC mismatch: calculated {calculated:04x}, received {received:04x}")]
    CrcMismatch { calculated: u16, received: u16 },
    #[error("Payload too long: {0} bytes (max 65535)")]
    PayloadTooLong(usize),
    #[error("Buffer too small: need {required}, have {available}")]
    BufferTooSmall { required: usize, available: usize },
    #[error("Incomplete packet: expected {expected} bytes, have {actual}")]
    IncompletePacket { expected: usize, actual: usize },
    #[error("Unknown command: {0}")]
    UnknownCommand(u8),
}

/// Packet buffer with fixed capacity for encoding packets
pub struct PacketBuffer {
    data: [u8; MAX_PACKET_SIZE],
    len: usize,
}

impl Default for PacketBuffer {
    fn default() -> Self {
        Self::new()
    }
}

impl PacketBuffer {
    /// Create a new empty packet buffer
    pub fn new() -> Self {
        Self {
            data: [0u8; MAX_PACKET_SIZE],
            len: 0,
        }
    }

    /// Clear the buffer
    pub fn clear(&mut self) {
        self.len = 0;
    }

    /// Get the current data in the buffer
    pub fn as_slice(&self) -> &[u8] {
        &self.data[..self.len]
    }

    /// Encode a packet with given command and payload
    ///
    /// Returns the encoded packet as a byte slice.
    ///
    /// # Arguments
    /// * `command` - The VESC command to encode
    /// * `payload` - Additional payload data (can be empty)
    ///
    /// # Errors
    /// Returns `ProtocolError::PayloadTooLong` if payload exceeds 65535 bytes
    pub fn encode(&mut self, command: Command, payload: &[u8]) -> Result<&[u8], ProtocolError> {
        self.clear();

        // Total payload = command byte + payload data
        let total_len = 1 + payload.len();

        if total_len > MAX_PAYLOAD_LEN {
            return Err(ProtocolError::PayloadTooLong(payload.len()));
        }

        if total_len <= 255 {
            // Short packet: 0x02 [len:u8] [payload] [CRC:u16] 0x03
            self.data[0] = START_BYTE_SHORT;
            self.data[1] = total_len as u8;
            self.data[2] = command.to_u8();

            if !payload.is_empty() {
                self.data[3..3 + payload.len()].copy_from_slice(payload);
            }

            let payload_slice = &self.data[2..2 + total_len];
            let crc = calculate_crc(payload_slice);

            let crc_start = 2 + total_len;
            self.data[crc_start] = (crc >> 8) as u8;
            self.data[crc_start + 1] = (crc & 0xFF) as u8;
            self.data[crc_start + 2] = STOP_BYTE;

            self.len = crc_start + 3;
        } else {
            // Long packet: 0x03 [len:u16 BE] [payload] [CRC:u16] 0x03
            self.data[0] = START_BYTE_LONG;
            self.data[1] = (total_len >> 8) as u8;
            self.data[2] = (total_len & 0xFF) as u8;
            self.data[3] = command.to_u8();

            if !payload.is_empty() {
                self.data[4..4 + payload.len()].copy_from_slice(payload);
            }

            let payload_slice = &self.data[3..3 + total_len];
            let crc = calculate_crc(payload_slice);

            let crc_start = 3 + total_len;
            self.data[crc_start] = (crc >> 8) as u8;
            self.data[crc_start + 1] = (crc & 0xFF) as u8;
            self.data[crc_start + 2] = STOP_BYTE;

            self.len = crc_start + 3;
        }

        Ok(&self.data[..self.len])
    }

    /// Try to decode a packet from the provided data buffer
    ///
    /// Returns `Ok(Some(DecodedPacket))` if a complete valid packet was found,
    /// `Ok(None)` if more data is needed, or an error if the data is invalid.
    pub fn try_decode(&self, data: &[u8]) -> Result<Option<DecodedPacket>, ProtocolError> {
        decode_packet_internal(data, true)
    }
}

/// Firmware version information parsed from COMM_FW_VERSION response
#[derive(Debug, Clone, Serialize)]
pub struct FirmwareVersion {
    pub version_major: u8,
    pub version_minor: u8,
    pub name: String,
    pub hardware_name: String,
    pub uuid: [u8; 16],
    pub compile_date: String,
}

impl FirmwareVersion {
    /// Format UUID as a hex string
    pub fn uuid_hex(&self) -> String {
        self.uuid.iter()
            .map(|b| format!("{:02x}", b))
            .collect::<Vec<_>>()
            .join("")
    }
}

/// Decoded packet structure
#[derive(Debug, Clone, PartialEq)]
pub struct DecodedPacket {
    /// The decoded command
    pub command: Command,
    /// The payload data (excluding command byte)
    pub payload: Vec<u8>,
}

impl DecodedPacket {
    /// Create a new decoded packet
    pub fn new(command: Command, payload: Vec<u8>) -> Self {
        Self { command, payload }
    }

    /// Get the command byte
    pub fn command_byte(&self) -> u8 {
        self.command.to_u8()
    }

    /// Parse firmware version from COMM_FW_VERSION response
    ///
    /// Format: [version_major:u8] [version_minor:u8] [name:str] [0x00] [hw_name:str] [0x00] [uuid:16bytes] [compile_date:str]
    pub fn parse_firmware_version(&self) -> Result<FirmwareVersion, ProtocolError> {
        if self.payload.len() < 2 {
            return Err(ProtocolError::IncompletePacket {
                expected: 2,
                actual: self.payload.len(),
            });
        }

        let version_major = self.payload[0];
        let version_minor = self.payload[1];

        // Parse null-terminated strings and UUID from the payload
        let mut idx = 2;
        
        // Parse firmware name (null-terminated string)
        let name = if idx < self.payload.len() {
            let start = idx;
            while idx < self.payload.len() && self.payload[idx] != 0 {
                idx += 1;
            }
            let name_bytes = &self.payload[start..idx];
            String::from_utf8_lossy(name_bytes).to_string()
        } else {
            String::new()
        };

        // Skip null terminator
        if idx < self.payload.len() && self.payload[idx] == 0 {
            idx += 1;
        }

        // Parse hardware name (null-terminated string)
        let hardware_name = if idx < self.payload.len() {
            let start = idx;
            while idx < self.payload.len() && self.payload[idx] != 0 {
                idx += 1;
            }
            let hw_bytes = &self.payload[start..idx];
            String::from_utf8_lossy(hw_bytes).to_string()
        } else {
            String::new()
        };

        // Skip null terminator
        if idx < self.payload.len() && self.payload[idx] == 0 {
            idx += 1;
        }

        // Parse UUID (16 bytes) - if available
        let mut uuid = [0u8; 16];
        if idx + 16 <= self.payload.len() {
            uuid.copy_from_slice(&self.payload[idx..idx + 16]);
            idx += 16;
        }

        // Parse compile date (remaining bytes or until null)
        let compile_date = if idx < self.payload.len() {
            let start = idx;
            while idx < self.payload.len() && self.payload[idx] != 0 {
                idx += 1;
            }
            let date_bytes = &self.payload[start..idx];
            String::from_utf8_lossy(date_bytes).to_string()
        } else {
            String::new()
        };

        Ok(FirmwareVersion {
            version_major,
            version_minor,
            name,
            hardware_name,
            uuid,
            compile_date,
        })
    }
}

/// Encode a packet (convenience function)
///
/// Creates a new vector containing the encoded packet.
///
/// # Arguments
/// * `command` - The VESC command to encode
/// * `payload` - Optional additional payload data
///
/// # Example
/// ```
/// use veac::vesc::protocol::{encode_packet, Command};
///
/// let packet = encode_packet(Command::CommGetValues, None).unwrap();
/// ```
pub fn encode_packet(command: Command, payload: Option<&[u8]>) -> Result<Vec<u8>, ProtocolError> {
    let mut buffer = PacketBuffer::new();
    let data = buffer.encode(command, payload.unwrap_or(&[]))?;
    Ok(data.to_vec())
}

/// Calculate CRC16-CCITT-FALSE over data using USB polynomial
///
/// Uses the crc16 crate with USB polynomial (CRC-16/USB).
/// The CRC is calculated over the payload bytes only.
pub fn calculate_crc(data: &[u8]) -> u16 {
    crc16::State::<crc16::USB>::calculate(data)
}

/// Decode packet from bytes (convenience function)
///
/// Attempts to decode a VESC packet from the provided data.
///
/// # Arguments
/// * `data` - The raw bytes to decode
///
/// # Returns
/// * `Ok(Some(DecodedPacket))` - Successfully decoded packet
/// * `Ok(None)` - Incomplete packet, need more data
/// * `Err(ProtocolError)` - Invalid data
///
/// # Example
/// ```
/// use veac::vesc::protocol::decode_packet;
///
/// // Example packet: GetValues command
/// let data = vec![0x02, 0x01, 0x04, 0xNN, 0xNN, 0x03];
/// match decode_packet(&data) {
///     Ok(Some(packet)) => println!("Command: {:?}", packet.command),
///     Ok(None) => println!("Need more data"),
///     Err(e) => println!("Error: {}", e),
/// }
/// ```
pub fn decode_packet(data: &[u8]) -> Result<Option<DecodedPacket>, ProtocolError> {
    decode_packet_internal(data, true)
}

/// Decode packet with option to skip stop byte validation
///
/// This is useful for compatibility with non-standard implementations
/// that may not include the stop byte.
pub fn decode_packet_lenient(data: &[u8]) -> Result<Option<DecodedPacket>, ProtocolError> {
    decode_packet_internal(data, false)
}

/// Internal decode implementation
fn decode_packet_internal(
    data: &[u8],
    validate_stop_byte: bool,
) -> Result<Option<DecodedPacket>, ProtocolError> {
    if data.is_empty() {
        return Ok(None);
    }

    let start_byte = data[0];

    // Determine packet type and length
    let (payload_len, header_len, is_short) = match start_byte {
        START_BYTE_SHORT => {
            // Short packet: 0x02 [len:u8] [payload:N] [CRC:u16] 0x03
            if data.len() < 2 {
                return Ok(None); // Need more data for length byte
            }
            let len = data[1] as usize;
            (len, 2, true)
        }
        START_BYTE_LONG => {
            // Long packet: 0x03 [len:u16 BE] [payload:N] [CRC:u16] 0x03
            if data.len() < 3 {
                return Ok(None); // Need more data for length bytes
            }
            let len = ((data[1] as usize) << 8) | (data[2] as usize);
            (len, 3, false)
        }
        _ => return Err(ProtocolError::InvalidStartByte(start_byte)),
    };

    // Calculate total packet length
    let total_len = header_len + payload_len + 3; // header + payload + CRC + stop

    if data.len() < total_len {
        return Ok(None); // Need more data
    }

    // Validate stop byte if requested
    if validate_stop_byte {
        let stop_byte = data[total_len - 1];
        if stop_byte != STOP_BYTE {
            return Err(ProtocolError::InvalidStopByte(stop_byte));
        }
    }

    // Extract payload
    let payload_start = header_len;
    let payload_end = payload_start + payload_len;
    let payload = &data[payload_start..payload_end];

    // Verify CRC
    let crc_start = payload_end;
    let received_crc = ((data[crc_start] as u16) << 8) | (data[crc_start + 1] as u16);
    let calculated_crc = calculate_crc(payload);

    if received_crc != calculated_crc {
        return Err(ProtocolError::CrcMismatch {
            calculated: calculated_crc,
            received: received_crc,
        });
    }

    // Extract command from payload
    if payload.is_empty() {
        return Err(ProtocolError::IncompletePacket {
            expected: 1,
            actual: 0,
        });
    }

    let command_byte = payload[0];
    let command = Command::from_u8(command_byte)
        .ok_or(ProtocolError::UnknownCommand(command_byte))?;

    // Rest of payload is command data
    let payload_data = if payload.len() > 1 {
        payload[1..].to_vec()
    } else {
        Vec::new()
    };

    Ok(Some(DecodedPacket {
        command,
        payload: payload_data,
    }))
}

/// Find packet boundaries in a byte stream
///
/// Scans through data looking for valid packet start bytes.
/// Returns the index of the first potential packet start, or None if no start byte found.
///
/// This is useful for resynchronization when parsing a continuous stream.
pub fn find_packet_start(data: &[u8]) -> Option<usize> {
    data.iter()
        .position(|&b| b == START_BYTE_SHORT || b == START_BYTE_LONG)
}

/// Calculate the expected packet size from header bytes
///
/// Returns `Some(expected_size)` if enough data is present to determine size,
/// `None` otherwise.
pub fn expected_packet_size(data: &[u8]) -> Option<usize> {
    if data.is_empty() {
        return None;
    }

    match data[0] {
        START_BYTE_SHORT => {
            if data.len() < 2 {
                return None;
            }
            let payload_len = data[1] as usize;
            Some(2 + payload_len + 3) // header + payload + CRC + stop
        }
        START_BYTE_LONG => {
            if data.len() < 3 {
                return None;
            }
            let payload_len = ((data[1] as usize) << 8) | (data[2] as usize);
            Some(3 + payload_len + 3) // header + payload + CRC + stop
        }
        _ => None,
    }
}

/// Check if data contains at least one complete packet
///
/// Returns `true` if the data buffer contains enough bytes for a complete packet.
pub fn has_complete_packet(data: &[u8]) -> bool {
    expected_packet_size(data).map_or(false, |expected| data.len() >= expected)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_command_enum_roundtrip() {
        // Test that all commands can convert to u8 and back
        let commands = [
            Command::CommFwVersion,
            Command::CommJumpToBootloader,
            Command::CommEraseNewApp,
            Command::CommWriteNewAppData,
            Command::CommGetValues,
            Command::CommSetDuty,
            Command::CommSetCurrent,
            Command::CommSetCurrentBrake,
            Command::CommSetRpm,
            Command::CommSetPos,
            Command::CommSetHandbrake,
            Command::CommSetDetect,
            Command::CommSetServoPos,
            Command::CommSetMcConf,
            Command::CommGetMcConf,
            Command::CommGetMcConfDefault,
            Command::CommSetAppConf,
            Command::CommGetAppConf,
            Command::CommGetAppConfDefault,
            Command::CommSamplePrint,
            Command::CommTerminalCmd,
            Command::CommPrint,
            Command::CommRotorPosition,
            Command::CommExperimentSample,
            Command::CommDetectMotorParam,
            Command::CommDetectMotorR_L,
            Command::CommDetectMotorFluxLinkage,
            Command::CommDetectEncoder,
            Command::CommDetectHallFoc,
            Command::CommReboot,
            Command::CommAlive,
            Command::CommGetDecodedPpm,
            Command::CommGetDecodedAdc,
            Command::CommGetDecodedChuk,
            Command::CommForwardCan,
            Command::CommSetChuckData,
            Command::CommCustomAppData,
            Command::CommNrfStartPairing,
            Command::CommNrfSetMacAddr,
            Command::CommNrfSetEncKey,
            Command::CommNrfSetRadioChannel,
            Command::CommNrfPairingStarted,
            Command::CommNrfPairingOk,
            Command::CommNrfPairingFailed,
            Command::CommImuCalibrate,
            Command::CommLispSetRunning,
            Command::CommLispGetStats,
            Command::CommLispReload,
            Command::CommGetImuCalibration,
            Command::CommGetImuCalibration6,
            Command::CommGetImuCalibration9,
            Command::CommLispRead,
            Command::CommLispWrite,
            Command::CommLispErase,
            Command::CommLispReplCmd,
            Command::CommLispStreamCode,
            Command::CommGetGnss,
            Command::CommLogDataF32,
        ];

        for cmd in commands.iter() {
            let byte = cmd.to_u8();
            let roundtrip = Command::from_u8(byte).unwrap();
            assert_eq!(*cmd, roundtrip, "Command {:?} (0x{:02x}) failed roundtrip", cmd, byte);
        }
    }

    #[test]
    fn test_command_from_u8_invalid() {
        assert!(Command::from_u8(100).is_none());
        assert!(Command::from_u8(255).is_none());
    }

    #[test]
    fn test_encode_short_packet() {
        let mut buffer = PacketBuffer::new();
        let packet = buffer.encode(Command::CommGetValues, &[]).unwrap();

        // Structure: [0x02] [len=1] [cmd=0x04] [CRC:2] [0x03]
        assert_eq!(packet[0], START_BYTE_SHORT);
        assert_eq!(packet[1], 1); // length = 1 (command byte only)
        assert_eq!(packet[2], 0x04); // COMM_GET_VALUES

        // Last byte should be stop byte
        assert_eq!(packet[packet.len() - 1], STOP_BYTE);

        // Total length: 2 (header) + 1 (payload) + 2 (CRC) + 1 (stop) = 6
        assert_eq!(packet.len(), 6);
    }

    #[test]
    fn test_encode_with_payload() {
        let mut buffer = PacketBuffer::new();
        let payload = vec![0x01, 0x02, 0x03];
        let packet = buffer.encode(Command::CommSetDuty, &payload).unwrap();

        // Structure: [0x02] [len=4] [cmd=0x05] [0x01 0x02 0x03] [CRC:2] [0x03]
        assert_eq!(packet[0], START_BYTE_SHORT);
        assert_eq!(packet[1], 4); // length = 1 (cmd) + 3 (payload)
        assert_eq!(packet[2], 0x05); // COMM_SET_DUTY
        assert_eq!(&packet[3..6], &[0x01, 0x02, 0x03]);
    }

    #[test]
    fn test_encode_decode_roundtrip() {
        let payload = vec![0xAB, 0xCD, 0xEF];
        let encoded = encode_packet(Command::CommSetCurrent, Some(&payload)).unwrap();

        let decoded = decode_packet(&encoded).unwrap().unwrap();
        assert_eq!(decoded.command, Command::CommSetCurrent);
        assert_eq!(decoded.payload, payload);
    }

    #[test]
    fn test_decode_incomplete_packet() {
        // Just start byte
        let result = decode_packet(&[START_BYTE_SHORT]).unwrap();
        assert!(result.is_none());

        // Start + length, but no payload/CRC/stop
        let result = decode_packet(&[START_BYTE_SHORT, 0x01]).unwrap();
        assert!(result.is_none());

        // Complete header + partial payload
        let result = decode_packet(&[START_BYTE_SHORT, 0x05, 0x04]).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_decode_invalid_start_byte() {
        let result = decode_packet(&[0xFF]);
        assert!(matches!(result, Err(ProtocolError::InvalidStartByte(0xFF))));
    }

    #[test]
    fn test_decode_invalid_stop_byte() {
        // Create a valid packet but modify the stop byte
        let mut encoded = encode_packet(Command::CommAlive, None).unwrap();
        let last_idx = encoded.len() - 1;
        encoded[last_idx] = 0xFF;

        let result = decode_packet(&encoded);
        assert!(matches!(result, Err(ProtocolError::InvalidStopByte(0xFF))));
    }

    #[test]
    fn test_decode_crc_mismatch() {
        // Create a valid packet but corrupt a payload byte
        let mut encoded = encode_packet(Command::CommGetValues, None).unwrap();
        encoded[2] = 0xFF; // Corrupt command byte

        let result = decode_packet(&encoded);
        assert!(matches!(result, Err(ProtocolError::CrcMismatch { .. })));
    }

    #[test]
    fn test_decode_lenient_skips_stop_byte() {
        // Create a packet with wrong stop byte
        let mut encoded = encode_packet(Command::CommAlive, None).unwrap();
        let last_idx = encoded.len() - 1;
        encoded[last_idx] = 0xFF;

        // Lenient decode should succeed
        let decoded = decode_packet_lenient(&encoded).unwrap().unwrap();
        assert_eq!(decoded.command, Command::CommAlive);
    }

    #[test]
    fn test_find_packet_start() {
        assert_eq!(find_packet_start(&[START_BYTE_SHORT, 0x01]), Some(0));
        assert_eq!(find_packet_start(&[START_BYTE_LONG, 0x00, 0x01]), Some(0));
        assert_eq!(find_packet_start(&[0xFF, 0xFE, START_BYTE_SHORT]), Some(2));
        assert_eq!(find_packet_start(&[0xFF, 0xFE, 0xFD]), None);
    }

    #[test]
    fn test_expected_packet_size() {
        // Short packet: 5 bytes payload
        assert_eq!(
            expected_packet_size(&[START_BYTE_SHORT, 0x05]),
            Some(2 + 5 + 3) // header + payload + CRC + stop
        );

        // Long packet: 300 bytes payload
        assert_eq!(
            expected_packet_size(&[START_BYTE_LONG, 0x01, 0x2C]),
            Some(3 + 300 + 3) // header + payload + CRC + stop
        );

        // Incomplete
        assert_eq!(expected_packet_size(&[START_BYTE_SHORT]), None);
        assert_eq!(expected_packet_size(&[START_BYTE_LONG, 0x01]), None);
    }

    #[test]
    fn test_has_complete_packet() {
        let packet = encode_packet(Command::CommAlive, None).unwrap();
        assert!(has_complete_packet(&packet));
        assert!(!has_complete_packet(&packet[..3]));
    }

    #[test]
    fn test_decode_empty_payload() {
        let encoded = encode_packet(Command::CommReboot, None).unwrap();
        let decoded = decode_packet(&encoded).unwrap().unwrap();

        assert_eq!(decoded.command, Command::CommReboot);
        assert!(decoded.payload.is_empty());
    }

    #[test]
    fn test_decode_unknown_command() {
        // Create packet with invalid command byte (100)
        let mut buffer = PacketBuffer::new();
        let packet = buffer.encode(Command::CommAlive, &[]).unwrap().to_vec();

        // Modify the command byte position
        let mut modified = packet.clone();
        modified[2] = 100; // Unknown command

        // Recalculate CRC for the modified payload
        let payload = &[100u8]; // New command byte
        let crc = calculate_crc(payload);
        let crc_pos = packet.len() - 3;
        modified[crc_pos] = (crc >> 8) as u8;
        modified[crc_pos + 1] = (crc & 0xFF) as u8;

        let result = decode_packet(&modified);
        assert!(matches!(result, Err(ProtocolError::UnknownCommand(100))));
    }

    #[test]
    fn test_long_packet_encode_decode() {
        // Create a payload that requires long packet format (>254 bytes total payload)
        let large_payload = vec![0xAAu8; 300];
        let encoded = encode_packet(Command::CommCustomAppData, Some(&large_payload)).unwrap();

        // Should use long packet format
        assert_eq!(encoded[0], START_BYTE_LONG);

        // Decode and verify
        let decoded = decode_packet(&encoded).unwrap().unwrap();
        assert_eq!(decoded.command, Command::CommCustomAppData);
        assert_eq!(decoded.payload, large_payload);
    }

    #[test]
    fn test_payload_too_long() {
        let huge_payload = vec![0x00u8; 65536];
        let result = encode_packet(Command::CommCustomAppData, Some(&huge_payload));
        assert!(matches!(result, Err(ProtocolError::PayloadTooLong(65535))));
    }

    #[test]
    fn test_decoded_packet_getters() {
        let packet = DecodedPacket::new(Command::CommGetValues, vec![0x01, 0x02]);
        assert_eq!(packet.command_byte(), 0x04);
        assert_eq!(packet.command, Command::CommGetValues);
        assert_eq!(packet.payload, vec![0x01, 0x02]);
    }

    #[test]
    fn test_protocol_error_display() {
        let err = ProtocolError::InvalidStartByte(0xFF);
        assert!(err.to_string().contains("0xff"));

        let err = ProtocolError::CrcMismatch {
            calculated: 0x1234,
            received: 0x5678,
        };
        assert!(err.to_string().contains("1234"));
        assert!(err.to_string().contains("5678"));
    }

    #[test]
    fn test_parse_firmware_version() {
        // Build a firmware version payload: [major] [minor] [name\0] [hw_name\0] [uuid:16] [compile_date]
        let name = b"VESC Firmware\0";
        let hw_name = b"VESC 100_250\0";
        let uuid: [u8; 16] = [0xa1, 0xb2, 0xc3, 0xd4, 0xe5, 0xf6, 0x00, 0x01,
                               0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09];
        let compile_date = b"Jan 15 2024";

        let mut payload = vec![6u8, 2u8]; // major=6, minor=2
        payload.extend_from_slice(name);
        payload.extend_from_slice(hw_name);
        payload.extend_from_slice(&uuid);
        payload.extend_from_slice(compile_date);

        let packet = DecodedPacket::new(Command::CommFwVersion, payload);
        let version = packet.parse_firmware_version().unwrap();

        assert_eq!(version.version_major, 6);
        assert_eq!(version.version_minor, 2);
        assert_eq!(version.name, "VESC Firmware");
        assert_eq!(version.hardware_name, "VESC 100_250");
        assert_eq!(version.uuid, uuid);
        assert_eq!(version.compile_date, "Jan 15 2024");

        // Test UUID hex formatting
        let uuid_hex = version.uuid_hex();
        assert_eq!(uuid_hex.len(), 32); // 16 bytes * 2 hex chars
        assert!(uuid_hex.contains("a1"));
        assert!(uuid_hex.contains("b2"));
    }

    #[test]
    fn test_parse_firmware_version_minimal() {
        // Minimal payload with just major/minor
        let payload = vec![5u8, 3u8];
        let packet = DecodedPacket::new(Command::CommFwVersion, payload);
        let version = packet.parse_firmware_version().unwrap();

        assert_eq!(version.version_major, 5);
        assert_eq!(version.version_minor, 3);
        assert_eq!(version.name, "");
        assert_eq!(version.hardware_name, "");
        assert_eq!(version.uuid, [0u8; 16]);
        assert_eq!(version.compile_date, "");
    }

    #[test]
    fn test_parse_firmware_version_incomplete() {
        // Empty payload should fail
        let packet = DecodedPacket::new(Command::CommFwVersion, vec![]);
        let result = packet.parse_firmware_version();
        assert!(result.is_err());

        // Single byte payload should fail
        let packet = DecodedPacket::new(Command::CommFwVersion, vec![6u8]);
        let result = packet.parse_firmware_version();
        assert!(result.is_err());
    }

    // ============================================================================
    // Additional Unit Tests for Comprehensive Coverage
    // ============================================================================

    /// Test short packet encoding with various payload sizes (< 256 bytes)
    #[test]
    fn test_short_packet_various_sizes() {
        let test_sizes = [0, 1, 10, 100, 200, 254];
        
        for size in test_sizes.iter() {
            let payload = vec![0xABu8; *size];
            let encoded = encode_packet(Command::CommCustomAppData, Some(&payload)).unwrap();
            
            // Verify short packet format
            assert_eq!(encoded[0], START_BYTE_SHORT, "Should use short packet format for payload size {}", size);
            assert_eq!(encoded[1] as usize, 1 + size, "Length byte should be command + payload for size {}", size);
            assert_eq!(encoded[encoded.len() - 1], STOP_BYTE, "Should end with stop byte");
            
            // Verify roundtrip
            let decoded = decode_packet(&encoded).unwrap().unwrap();
            assert_eq!(decoded.command, Command::CommCustomAppData);
            assert_eq!(decoded.payload, payload);
        }
    }

    /// Test long packet encoding (> 256 bytes)
    #[test]
    fn test_long_packet_various_sizes() {
        let test_sizes = [255, 256, 300, 1000, 5000, 10000];
        
        for size in test_sizes.iter() {
            let payload = vec![0xCDu8; *size];
            let encoded = encode_packet(Command::CommCustomAppData, Some(&payload)).unwrap();
            
            // Verify long packet format
            assert_eq!(encoded[0], START_BYTE_LONG, "Should use long packet format for payload size {}", size);
            
            // Verify length encoding (big-endian u16)
            let len = ((encoded[1] as usize) << 8) | (encoded[2] as usize);
            assert_eq!(len, 1 + size, "Length should be command + payload for size {}", size);
            assert_eq!(encoded[encoded.len() - 1], STOP_BYTE, "Should end with stop byte");
            
            // Verify roundtrip
            let decoded = decode_packet(&encoded).unwrap().unwrap();
            assert_eq!(decoded.command, Command::CommCustomAppData);
            assert_eq!(decoded.payload.len(), *size, "Payload size should match");
            assert_eq!(decoded.payload, payload);
        }
    }

    /// Test empty payload encoding for all commands
    #[test]
    fn test_empty_payload_all_commands() {
        let commands = all_test_commands();
        
        for cmd in commands.iter() {
            let encoded = encode_packet(*cmd, None).unwrap();
            let decoded = decode_packet(&encoded).unwrap().unwrap();
            
            assert_eq!(decoded.command, *cmd, "Command {:?} should roundtrip correctly", cmd);
            assert!(decoded.payload.is_empty(), "Empty payload should remain empty for {:?}", cmd);
        }
    }

    /// Test maximum payload size boundary
    #[test]
    fn test_maximum_payload_size() {
        // Maximum payload is 65535 bytes (u16 max)
        let max_payload = vec![0xEFu8; MAX_PAYLOAD_LEN - 1]; // -1 for command byte
        
        let encoded = encode_packet(Command::CommCustomAppData, Some(&max_payload)).unwrap();
        assert_eq!(encoded[0], START_BYTE_LONG, "Max payload should use long packet format");
        
        let decoded = decode_packet(&encoded).unwrap().unwrap();
        assert_eq!(decoded.payload.len(), MAX_PAYLOAD_LEN - 1);
    }

    /// Test payload too large error
    #[test]
    fn test_payload_too_large_error() {
        // Payload exceeding MAX_PAYLOAD_LEN should fail
        let huge_payload = vec![0x00u8; MAX_PAYLOAD_LEN + 1];
        let result = encode_packet(Command::CommCustomAppData, Some(&huge_payload));
        
        assert!(result.is_err(), "Should fail for payload exceeding maximum");
        match result {
            Err(ProtocolError::PayloadTooLong(_)) => (), // Expected
            _ => panic!("Expected PayloadTooLong error"),
        }
    }

    /// Test CRC validation edge cases
    #[test]
    fn test_crc_edge_cases() {
        // Test CRC with empty data
        let crc_empty = calculate_crc(&[]);
        assert_eq!(crc_empty, 0x0000, "CRC of empty data should be 0");
        
        // Test CRC with single byte
        let crc_single = calculate_crc(&[0x00]);
        assert_ne!(crc_single, 0, "CRC of single byte should not be 0");
        
        // Test CRC with all zeros
        let zeros = vec![0x00u8; 100];
        let crc_zeros = calculate_crc(&zeros);
        assert_ne!(crc_zeros, 0, "CRC of zeros should not be 0");
        
        // Test CRC with all ones
        let ones = vec![0xFFu8; 100];
        let crc_ones = calculate_crc(&ones);
        assert_ne!(crc_ones, 0, "CRC of ones should not be 0");
    }

    /// Test CRC mismatch detection with various corruptions
    #[test]
    fn test_crc_mismatch_various_corruptions() {
        let original = encode_packet(Command::CommGetValues, Some(&[0x01, 0x02, 0x03])).unwrap();
        
        // Corrupt first payload byte
        let mut corrupted = original.clone();
        corrupted[2] ^= 0xFF; // XOR to flip all bits
        let result = decode_packet(&corrupted);
        assert!(matches!(result, Err(ProtocolError::CrcMismatch { .. })), "Should detect CRC mismatch from payload corruption");
        
        // Corrupt CRC byte
        let mut corrupted = original.clone();
        let crc_idx = original.len() - 3;
        corrupted[crc_idx] ^= 0xFF;
        let result = decode_packet(&corrupted);
        assert!(matches!(result, Err(ProtocolError::CrcMismatch { .. })), "Should detect CRC mismatch from CRC corruption");
    }

    /// Test error handling for invalid start bytes
    #[test]
    fn test_invalid_start_bytes() {
        let invalid_bytes = [0x00, 0x01, 0x04, 0xFF, 0xAA, 0x55];
        
        for byte in invalid_bytes.iter() {
            let data = vec![*byte, 0x01, 0x00, 0x00, 0x03];
            let result = decode_packet(&data);
            assert!(matches!(result, Err(ProtocolError::InvalidStartByte(b)) if b == *byte), 
                "Should detect invalid start byte 0x{:02x}", byte);
        }
    }

    /// Test error handling for invalid stop bytes
    #[test]
    fn test_invalid_stop_bytes() {
        let payload = encode_packet(Command::CommAlive, None).unwrap();
        
        for invalid_stop in [0x00, 0x02, 0x04, 0xFF].iter() {
            let mut corrupted = payload.clone();
            let last_idx = corrupted.len() - 1;
            corrupted[last_idx] = *invalid_stop;
            
            let result = decode_packet(&corrupted);
            assert!(matches!(result, Err(ProtocolError::InvalidStopByte(b)) if b == *invalid_stop),
                "Should detect invalid stop byte 0x{:02x}", invalid_stop);
        }
    }

    /// Test buffer overflow handling with PacketBuffer
    #[test]
    fn test_packet_buffer_overflow_protection() {
        let mut buffer = PacketBuffer::new();
        
        // Try to encode maximum allowed payload
        let max_payload = vec![0x00u8; MAX_PAYLOAD_LEN - 1];
        let result = buffer.encode(Command::CommCustomAppData, &max_payload);
        assert!(result.is_ok(), "Should handle maximum payload");
        
        // Try to encode payload exceeding maximum
        let huge_payload = vec![0x00u8; MAX_PAYLOAD_LEN + 100];
        let result = encode_packet(Command::CommCustomAppData, Some(&huge_payload));
        assert!(matches!(result, Err(ProtocolError::PayloadTooLong(_))));
    }

    /// Test find_packet_start with various data patterns
    #[test]
    fn test_find_packet_start_patterns() {
        // Valid short packet start at beginning
        assert_eq!(find_packet_start(&[START_BYTE_SHORT, 0x01]), Some(0));
        
        // Valid long packet start at beginning
        assert_eq!(find_packet_start(&[START_BYTE_LONG, 0x00, 0x01]), Some(0));
        
        // Start byte in middle of garbage
        assert_eq!(find_packet_start(&[0xFF, 0xFE, START_BYTE_SHORT, 0x01]), Some(2));
        assert_eq!(find_packet_start(&[0xFF, 0xFE, 0xFD, START_BYTE_LONG, 0x00, 0x01]), Some(3));
        
        // Multiple start bytes - should find first
        assert_eq!(find_packet_start(&[START_BYTE_SHORT, START_BYTE_LONG, 0x00, 0x01]), Some(0));
        
        // No valid start byte
        assert_eq!(find_packet_start(&[0xFF, 0xFE, 0xFD]), None);
        
        // Empty slice
        assert_eq!(find_packet_start(&[]), None);
    }

    /// Test expected_packet_size with various scenarios
    #[test]
    fn test_expected_packet_size_scenarios() {
        // Short packet with length
        assert_eq!(
            expected_packet_size(&[START_BYTE_SHORT, 0x05]),
            Some(2 + 5 + 3) // header + payload + CRC + stop
        );
        
        // Long packet with length
        assert_eq!(
            expected_packet_size(&[START_BYTE_LONG, 0x01, 0x2C]), // 300 in BE
            Some(3 + 300 + 3) // header + payload + CRC + stop
        );
        
        // Incomplete short packet header
        assert_eq!(expected_packet_size(&[START_BYTE_SHORT]), None);
        
        // Incomplete long packet header
        assert_eq!(expected_packet_size(&[START_BYTE_LONG, 0x01]), None);
        
        // Invalid start byte
        assert_eq!(expected_packet_size(&[0xFF]), None);
    }

    /// Test has_complete_packet with various buffer states
    #[test]
    fn test_has_complete_packet_states() {
        // Empty buffer
        assert!(!has_complete_packet(&[]));
        
        // Incomplete packet
        assert!(!has_complete_packet(&[START_BYTE_SHORT, 0x05]));
        
        // Complete short packet
        let short_packet = encode_packet(Command::CommAlive, None).unwrap();
        assert!(has_complete_packet(&short_packet));
        
        // Complete long packet
        let large_payload = vec![0x00u8; 300];
        let long_packet = encode_packet(Command::CommCustomAppData, Some(&large_payload)).unwrap();
        assert!(has_complete_packet(&long_packet));
        
        // Partial packet
        assert!(!has_complete_packet(&long_packet[..10]));
    }

    /// Test Command from_u8 for all valid commands
    #[test]
    fn test_command_from_u8_all_valid() {
        // Test all 58 commands (0-57)
        for i in 0..=57u8 {
            let cmd = Command::from_u8(i);
            assert!(cmd.is_some(), "Command {} should be valid", i);
            
            let cmd = cmd.unwrap();
            assert_eq!(cmd.to_u8(), i, "Command should roundtrip");
        }
    }

    /// Test Command from_u8 for invalid values
    #[test]
    fn test_command_from_u8_invalid_values() {
        let invalid_values = [58, 100, 200, 255];
        
        for val in invalid_values.iter() {
            assert!(Command::from_u8(*val).is_none(), "Command {} should be invalid", val);
        }
    }

    /// Test packet buffer clear and reuse
    #[test]
    fn test_packet_buffer_clear_and_reuse() {
        let mut buffer = PacketBuffer::new();
        
        // Encode first packet
        let packet1 = buffer.encode(Command::CommGetValues, &[]).unwrap().to_vec();
        
        // Clear and encode second packet
        buffer.clear();
        let payload2 = vec![0x01, 0x02, 0x03];
        let packet2 = buffer.encode(Command::CommSetDuty, &payload2).unwrap().to_vec();
        
        // Verify they're different
        assert_ne!(packet1, packet2, "Different packets should have different encoding");
        
        // Both should decode correctly
        let decoded1 = decode_packet(&packet1).unwrap().unwrap();
        assert_eq!(decoded1.command, Command::CommGetValues);
        
        let decoded2 = decode_packet(&packet2).unwrap().unwrap();
        assert_eq!(decoded2.command, Command::CommSetDuty);
        assert_eq!(decoded2.payload, payload2);
    }

    /// Test decode_packet_lenient mode
    #[test]
    fn test_decode_lenient_mode() {
        // Create packet with valid data but wrong stop byte
        let mut packet = encode_packet(Command::CommAlive, None).unwrap();
        let last_idx = packet.len() - 1;
        packet[last_idx] = 0xFF; // Wrong stop byte
        
        // Strict decode should fail
        let strict_result = decode_packet(&packet);
        assert!(matches!(strict_result, Err(ProtocolError::InvalidStopByte(0xFF))));
        
        // Lenient decode should succeed
        let lenient_result = decode_packet_lenient(&packet);
        assert!(lenient_result.is_ok());
        assert_eq!(lenient_result.unwrap().unwrap().command, Command::CommAlive);
    }

    /// Test incomplete packet detection with various lengths
    #[test]
    fn test_incomplete_packet_detection() {
        let packet = encode_packet(Command::CommGetValues, Some(&[0x01, 0x02, 0x03])).unwrap();
        
        // Test various partial lengths
        for i in 1..packet.len() {
            let partial = &packet[..i];
            let result = decode_packet(partial);
            
            // All partial packets should return Ok(None) - need more data
            assert!(result.is_ok(), "Partial packet of length {} should not error", i);
            assert!(result.unwrap().is_none(), "Partial packet of length {} should return None", i);
        }
        
        // Full packet should decode successfully
        let result = decode_packet(&packet);
        assert!(result.unwrap().is_some(), "Complete packet should decode successfully");
    }

    /// Test unknown command detection
    #[test]
    fn test_unknown_command_detection() {
        // Manually construct a packet with invalid command byte (100)
        let mut buffer = PacketBuffer::new();
        
        // Encode a valid packet first
        let valid_packet = buffer.encode(Command::CommAlive, &[]).unwrap().to_vec();
        
        // Modify command byte to invalid value
        let mut modified = valid_packet.clone();
        modified[2] = 100; // Unknown command
        
        // Recalculate CRC for the modified payload
        let payload = &[100u8];
        let crc = calculate_crc(payload);
        let crc_pos = valid_packet.len() - 3;
        modified[crc_pos] = (crc >> 8) as u8;
        modified[crc_pos + 1] = (crc & 0xFF) as u8;
        
        let result = decode_packet(&modified);
        assert!(matches!(result, Err(ProtocolError::UnknownCommand(100))));
    }

    /// Test packet buffer as_slice
    #[test]
    fn test_packet_buffer_as_slice() {
        let mut buffer = PacketBuffer::new();
        
        // Empty buffer should return empty slice
        assert_eq!(buffer.as_slice().len(), 0);
        
        // After encoding, should return valid data
        buffer.encode(Command::CommGetValues, &[]).unwrap();
        let slice = buffer.as_slice();
        assert!(slice.len() > 0);
        assert_eq!(slice[0], START_BYTE_SHORT);
    }

    /// Helper function to get all commands for testing
    fn all_test_commands() -> Vec<Command> {
        vec![
            Command::CommFwVersion,
            Command::CommJumpToBootloader,
            Command::CommEraseNewApp,
            Command::CommWriteNewAppData,
            Command::CommGetValues,
            Command::CommSetDuty,
            Command::CommSetCurrent,
            Command::CommSetCurrentBrake,
            Command::CommSetRpm,
            Command::CommSetPos,
            Command::CommSetHandbrake,
            Command::CommSetDetect,
            Command::CommSetServoPos,
            Command::CommSetMcConf,
            Command::CommGetMcConf,
            Command::CommGetMcConfDefault,
            Command::CommSetAppConf,
            Command::CommGetAppConf,
            Command::CommGetAppConfDefault,
            Command::CommSamplePrint,
            Command::CommTerminalCmd,
            Command::CommPrint,
            Command::CommRotorPosition,
            Command::CommExperimentSample,
            Command::CommDetectMotorParam,
            Command::CommDetectMotorR_L,
            Command::CommDetectMotorFluxLinkage,
            Command::CommDetectEncoder,
            Command::CommDetectHallFoc,
            Command::CommReboot,
            Command::CommAlive,
            Command::CommGetDecodedPpm,
            Command::CommGetDecodedAdc,
            Command::CommGetDecodedChuk,
            Command::CommForwardCan,
            Command::CommSetChuckData,
            Command::CommCustomAppData,
            Command::CommNrfStartPairing,
            Command::CommNrfSetMacAddr,
            Command::CommNrfSetEncKey,
            Command::CommNrfSetRadioChannel,
            Command::CommNrfPairingStarted,
            Command::CommNrfPairingOk,
            Command::CommNrfPairingFailed,
            Command::CommImuCalibrate,
            Command::CommLispSetRunning,
            Command::CommLispGetStats,
            Command::CommLispReload,
            Command::CommGetImuCalibration,
            Command::CommGetImuCalibration6,
            Command::CommGetImuCalibration9,
            Command::CommLispRead,
            Command::CommLispWrite,
            Command::CommLispErase,
            Command::CommLispReplCmd,
            Command::CommLispStreamCode,
            Command::CommGetGnss,
            Command::CommLogDataF32,
        ]
    }
}
