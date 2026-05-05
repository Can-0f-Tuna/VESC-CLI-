//! Test utilities for VESC CLI integration tests
//!
//! This module provides helper functions and utilities for testing
//! the VESC protocol implementation.

pub use veac::vesc::protocol::*;

/// Create a test packet with the given command and payload
///
/// # Arguments
/// * `command` - The VESC command to encode
/// * `payload` - Additional payload data
///
/// # Returns
/// Encoded packet as a byte vector
pub fn create_test_packet(command: Command, payload: &[u8]) -> Vec<u8> {
    encode_packet(command, Some(payload)).unwrap()
}

/// Assert that a packet can be encoded and decoded successfully
///
/// # Arguments
/// * `command` - The VESC command to test
/// * `payload` - Payload data to include
///
/// # Panics
/// Panics if encoding or decoding fails, or if the roundtrip doesn't match
pub fn assert_packet_roundtrip(command: Command, payload: &[u8]) {
    let encoded = encode_packet(command, Some(payload)).unwrap();
    let decoded = decode_packet(&encoded).unwrap().unwrap();
    assert_eq!(decoded.command, command, "Command should match after roundtrip");
    assert_eq!(decoded.payload, payload, "Payload should match after roundtrip");
}

/// Assert that an empty payload packet roundtrips correctly
///
/// # Arguments
/// * `command` - The VESC command to test
pub fn assert_empty_packet_roundtrip(command: Command) {
    let encoded = encode_packet(command, None).unwrap();
    let decoded = decode_packet(&encoded).unwrap().unwrap();
    assert_eq!(decoded.command, command, "Command should match after roundtrip");
    assert!(decoded.payload.is_empty(), "Payload should be empty");
}

/// Create a short packet (payload < 256 bytes)
///
/// # Arguments
/// * `command` - The command to encode
/// * `payload_size` - Size of the payload in bytes
///
/// # Returns
/// Encoded packet as a byte vector
pub fn create_short_packet(command: Command, payload_size: usize) -> Vec<u8> {
    let payload = vec![0xAAu8; payload_size];
    encode_packet(command, Some(&payload)).unwrap()
}

/// Create a long packet (payload >= 256 bytes)
///
/// # Arguments
/// * `command` - The command to encode
/// * `payload_size` - Size of the payload in bytes (must be >= 256)
///
/// # Returns
/// Encoded packet as a byte vector
pub fn create_long_packet(command: Command, payload_size: usize) -> Vec<u8> {
    assert!(payload_size >= 256, "Long packet requires payload >= 256 bytes");
    let payload = vec![0xBBu8; payload_size];
    encode_packet(command, Some(&payload)).unwrap()
}

/// Verify packet structure for short packets
///
/// # Arguments
/// * `packet` - The encoded packet bytes
/// * `expected_payload_len` - Expected payload length
///
/// # Panics
/// Panics if packet structure doesn't match VESC protocol
pub fn verify_short_packet_structure(packet: &[u8], expected_payload_len: usize) {
    // Short packet: [0x02] [len:u8] [payload] [CRC16:u16 BE] [0x03]
    assert_eq!(packet[0], START_BYTE_SHORT, "First byte should be START_BYTE_SHORT (0x02)");
    assert_eq!(packet[1] as usize, 1 + expected_payload_len, "Length byte should be command + payload");
    assert_eq!(packet[packet.len() - 1], STOP_BYTE, "Last byte should be STOP_BYTE (0x03)");
    
    // Total length: 2 (header) + 1 (command) + payload + 2 (CRC) + 1 (stop)
    let expected_total = 2 + 1 + expected_payload_len + 2 + 1;
    assert_eq!(packet.len(), expected_total, "Packet length should match expected structure");
}

/// Verify packet structure for long packets
///
/// # Arguments
/// * `packet` - The encoded packet bytes
/// * `expected_payload_len` - Expected payload length
///
/// # Panics
/// Panics if packet structure doesn't match VESC protocol
pub fn verify_long_packet_structure(packet: &[u8], expected_payload_len: usize) {
    // Long packet: [0x03] [len:u16 BE] [payload] [CRC16:u16 BE] [0x03]
    assert_eq!(packet[0], START_BYTE_LONG, "First byte should be START_BYTE_LONG (0x03)");
    
    let len = ((packet[1] as usize) << 8) | (packet[2] as usize);
    assert_eq!(len, 1 + expected_payload_len, "Length should be command + payload");
    assert_eq!(packet[packet.len() - 1], STOP_BYTE, "Last byte should be STOP_BYTE (0x03)");
    
    // Total length: 3 (header) + 1 (command) + payload + 2 (CRC) + 1 (stop)
    let expected_total = 3 + 1 + expected_payload_len + 2 + 1;
    assert_eq!(packet.len(), expected_total, "Packet length should match expected structure");
}

/// Calculate expected CRC for given data
///
/// # Arguments
/// * `data` - Data to calculate CRC for
///
/// # Returns
/// CRC16 value
pub fn expected_crc(data: &[u8]) -> u16 {
    calculate_crc(data)
}

/// Corrupt a packet's CRC
///
/// # Arguments
/// * `packet` - Mutable reference to packet bytes
pub fn corrupt_crc(packet: &mut [u8]) {
    // CRC is 2 bytes before the stop byte
    let crc_idx = packet.len() - 3;
    packet[crc_idx] = packet[crc_idx].wrapping_add(1);
    packet[crc_idx + 1] = packet[crc_idx + 1].wrapping_add(1);
}

/// Corrupt a packet's payload
///
/// # Arguments
/// * `packet` - Mutable reference to packet bytes
/// * `offset` - Offset into payload to corrupt (0 = command byte)
pub fn corrupt_payload(packet: &mut [u8], offset: usize) {
    let header_len = if packet[0] == START_BYTE_SHORT { 2 } else { 3 };
    let payload_idx = header_len + offset;
    if payload_idx < packet.len() - 3 {
        packet[payload_idx] = packet[payload_idx].wrapping_add(1);
    }
}

/// Extract payload from encoded packet (for verification)
///
/// # Arguments
/// * `packet` - Encoded packet bytes
///
/// # Returns
/// The payload bytes (excluding command byte)
pub fn extract_payload(packet: &[u8]) -> Vec<u8> {
    let decoded = decode_packet(packet).unwrap().unwrap();
    decoded.payload
}

/// Get all VESC commands for testing
///
/// # Returns
/// Vector of all Command enum variants
pub fn all_commands() -> Vec<Command> {
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

/// Test helper to verify a packet decodes to expected command and payload
///
/// # Arguments
/// * `packet` - Encoded packet bytes
/// * `expected_command` - Expected command
/// * `expected_payload` - Expected payload
///
/// # Panics
/// Panics if decoding fails or doesn't match expected values
pub fn assert_decoded_packet(packet: &[u8], expected_command: Command, expected_payload: &[u8]) {
    let decoded = decode_packet(packet).unwrap().unwrap();
    assert_eq!(decoded.command, expected_command, "Decoded command should match");
    assert_eq!(decoded.payload, expected_payload, "Decoded payload should match");
}
