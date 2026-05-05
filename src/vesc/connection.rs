//! VESC Serial Connection
//!
//! Async serial connection with automatic port scanning,
//! packet streaming, and response handling.

use crate::vesc::protocol::{Command, ProtocolError, encode_packet, decode_packet, DecodedPacket, FirmwareVersion, find_packet_start, expected_packet_size, has_complete_packet, START_BYTE_SHORT, START_BYTE_LONG};
use crate::vesc::telemetry::{MotorTelemetry, FaultCode};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::time::{timeout, Duration};
use tokio_serial::{SerialPortBuilderExt, SerialStream};
use thiserror::Error;
use anyhow::{Context, Result};

/// Connection error types
#[derive(Error, Debug)]
pub enum ConnectionError {
    #[error("Serial error: {0}")]
    Serial(#[from] tokio_serial::Error),
    #[error("Protocol error: {0}")]
    Protocol(#[from] ProtocolError),
    #[error("Timeout after {0:?}")]
    Timeout(Duration),
    #[error("No response from VESC")]
    NoResponse,
    #[error("Port not found: {0}")]
    PortNotFound(String),
    #[error("Not connected")]
    NotConnected,
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

/// Firmware information from COMM_FW_VERSION
#[derive(Debug, Clone)]
pub struct FirmwareInfo {
    pub version_major: u8,
    pub version_minor: u8,
    pub name: String,
    pub hardware_name: String,
    pub uuid: [u8; 16],
    pub compile_date: String,
}

/// Port information
#[derive(Debug, Clone)]
pub struct PortInfo {
    pub name: String,
    pub description: Option<String>,
    pub manufacturer: Option<String>,
    pub serial_number: Option<String>,
}

/// Default baud rate for VESC communication
pub const DEFAULT_BAUD_RATE: u32 = 115200;

/// Default timeout for operations
pub const DEFAULT_TIMEOUT: Duration = Duration::from_secs(2);

/// VESC serial connection manager
pub struct VescConnection {
    port: SerialStream,
    port_name: String,
    baud_rate: u32,
    read_buffer: Vec<u8>,
    timeout: Duration,
}

impl VescConnection {
    /// Open a new connection to a VESC controller
    ///
    /// # Arguments
    /// * `port_name` - Serial port name (e.g., "COM3" on Windows or "/dev/ttyUSB0" on Linux)
    /// * `baud_rate` - Baud rate for communication (typically 115200)
    ///
    /// # Returns
    /// A new VescConnection instance
    pub async fn open(port_name: &str, baud_rate: u32) -> Result<Self, ConnectionError> {
        let port = tokio_serial::new(port_name, baud_rate)
            .open_native_async()
            .map_err(|e| ConnectionError::Serial(e))?;

        Ok(Self {
            port,
            port_name: port_name.to_string(),
            baud_rate,
            read_buffer: Vec::with_capacity(1024),
            timeout: DEFAULT_TIMEOUT,
        })
    }

    /// Set the timeout duration for operations
    pub fn set_timeout(&mut self, timeout: Duration) {
        self.timeout = timeout;
    }

    /// Get the current timeout duration
    pub fn timeout(&self) -> Duration {
        self.timeout
    }

    /// Get the port name
    pub fn port_name(&self) -> &str {
        &self.port_name
    }

    /// Get the baud rate
    pub fn baud_rate(&self) -> u32 {
        self.baud_rate
    }

    /// Clear the read buffer
    fn clear_buffer(&mut self) {
        self.read_buffer.clear();
    }

    /// Send a command (fire and forget)
    ///
    /// # Arguments
    /// * `command` - The VESC command to send
    /// * `payload` - Optional payload data
    pub async fn send(&mut self, command: Command, payload: Option<&[u8]>) -> Result<(), ConnectionError> {
        let packet = encode_packet(command, payload)
            .map_err(|e| ConnectionError::Protocol(e))?;

        self.port
            .write_all(&packet)
            .await
            .map_err(|e| ConnectionError::Io(e))?;

        self.port
            .flush()
            .await
            .map_err(|e| ConnectionError::Io(e))?;

        Ok(())
    }

    /// Read bytes from the port into the internal buffer
    ///
    /// This method reads available bytes with a short timeout
    async fn read_bytes(&mut self) -> Result<usize, ConnectionError> {
        let mut temp_buf = [0u8; 256];
        
        match timeout(Duration::from_millis(100), self.port.read(&mut temp_buf)).await {
            Ok(Ok(n)) => {
                self.read_buffer.extend_from_slice(&temp_buf[..n]);
                Ok(n)
            }
            Ok(Err(e)) => Err(ConnectionError::Io(e)),
            Err(_) => Ok(0), // Timeout - no data available
        }
    }

    /// Try to decode a packet from the current buffer
    ///
    /// Returns the packet if found, or None if more data is needed
    fn try_decode_packet(&mut self) -> Result<Option<DecodedPacket>, ConnectionError> {
        loop {
            if self.read_buffer.is_empty() {
                return Ok(None);
            }

            // Find packet start
            match find_packet_start(&self.read_buffer) {
                Some(start_idx) => {
                    // Remove any garbage before the packet start
                    if start_idx > 0 {
                        self.read_buffer.drain(..start_idx);
                    }

                    // Try to decode
                    match decode_packet(&self.read_buffer) {
                        Ok(Some(packet)) => {
                            // Remove the processed packet from buffer
                            if let Some(expected_len) = expected_packet_size(&self.read_buffer) {
                                if self.read_buffer.len() >= expected_len {
                                    self.read_buffer.drain(..expected_len);
                                }
                            }
                            return Ok(Some(packet));
                        }
                        Ok(None) => {
                            // Need more data
                            return Ok(None);
                        }
                        Err(ProtocolError::InvalidStartByte(_)) => {
                            // Remove the invalid byte and continue searching
                            self.read_buffer.drain(..1);
                            continue;
                        }
                        Err(ProtocolError::InvalidStopByte(_)) => {
                            // Packet framing error - remove start byte and continue
                            self.read_buffer.drain(..1);
                            continue;
                        }
                        Err(ProtocolError::CrcMismatch { .. }) => {
                            // CRC error - remove start byte and continue
                            self.read_buffer.drain(..1);
                            continue;
                        }
                        Err(e) => {
                            return Err(ConnectionError::Protocol(e));
                        }
                    }
                }
                None => {
                    // No valid start byte found - clear buffer
                    self.read_buffer.clear();
                    return Ok(None);
                }
            }
        }
    }

    /// Wait for and decode a packet with timeout
    ///
    /// This method continuously reads from the port until a valid packet
    /// is received or the timeout expires.
    async fn receive_packet(&mut self) -> Result<DecodedPacket, ConnectionError> {
        let deadline = tokio::time::Instant::now() + self.timeout;

        loop {
            // Check if we've timed out
            if tokio::time::Instant::now() >= deadline {
                return Err(ConnectionError::Timeout(self.timeout));
            }

            // Try to decode any existing data first
            if let Some(packet) = self.try_decode_packet()? {
                return Ok(packet);
            }

            // Read more data with remaining timeout
            let remaining = deadline - tokio::time::Instant::now();
            if remaining.is_zero() {
                return Err(ConnectionError::Timeout(self.timeout));
            }

            let mut temp_buf = [0u8; 256];
            match timeout(remaining, self.port.read(&mut temp_buf)).await {
                Ok(Ok(0)) => {
                    // Port closed
                    return Err(ConnectionError::NoResponse);
                }
                Ok(Ok(n)) => {
                    self.read_buffer.extend_from_slice(&temp_buf[..n]);
                }
                Ok(Err(e)) => return Err(ConnectionError::Io(e)),
                Err(_) => {
                    return Err(ConnectionError::Timeout(self.timeout));
                }
            }
        }
    }

    /// Send command and wait for response
    ///
    /// This method:
    /// 1. Clears the read buffer
    /// 2. Sends the command
    /// 3. Reads and decodes the response packet
    /// 4. Returns the payload bytes
    pub async fn request(&mut self, command: Command, payload: Option<&[u8]>) -> Result<Vec<u8>, ConnectionError> {
        // Clear any pending data in the buffer
        self.clear_buffer();
        
        // Also clear any pending data from the port
        let mut temp_buf = [0u8; 256];
        loop {
            match timeout(Duration::from_millis(10), self.port.read(&mut temp_buf)).await {
                Ok(Ok(n)) if n > 0 => continue, // Keep draining
                _ => break, // Nothing more to read or error
            }
        }

        // Send the command
        self.send(command, payload).await?;

        // Wait for response
        let response = self.receive_packet().await?;

        Ok(response.payload)
    }

    /// Ping VESC (COMM_ALIVE)
    ///
    /// Sends a COMM_ALIVE command and checks if the VESC responds.
    /// This is useful for connection health checks.
    ///
    /// # Returns
    /// `true` if the VESC responded, `false` otherwise
    pub async fn ping(&mut self) -> Result<bool, ConnectionError> {
        let original_timeout = self.timeout;
        self.set_timeout(Duration::from_secs(1));

        let result = match self.request(Command::CommAlive, None).await {
            Ok(_) => Ok(true),
            Err(ConnectionError::Timeout(_)) => Ok(false),
            Err(e) => Err(e),
        };

        self.set_timeout(original_timeout);
        result
    }

    /// Get firmware version from VESC
    ///
    /// Sends COMM_FW_VERSION and parses the response to extract
    /// firmware version information including hardware name, UUID, and compile date.
    ///
    /// # Returns
    /// FirmwareInfo struct containing version, name, hardware info, UUID, and compile date
    pub async fn get_firmware_version(&mut self) -> Result<FirmwareInfo, ConnectionError> {
        let payload = self.request(Command::CommFwVersion, None).await?;

        // Create a DecodedPacket to use the firmware version parsing
        let packet = DecodedPacket::new(Command::CommFwVersion, payload);
        
        match packet.parse_firmware_version() {
            Ok(version) => {
                Ok(FirmwareInfo {
                    version_major: version.version_major,
                    version_minor: version.version_minor,
                    name: version.name,
                    hardware_name: version.hardware_name,
                    uuid: version.uuid,
                    compile_date: version.compile_date,
                })
            }
            Err(e) => Err(ConnectionError::Protocol(e)),
        }
    }

    /// Get real-time motor telemetry values
    ///
    /// Sends COMM_GET_VALUES and parses the response to extract
    /// complete motor telemetry including voltages, currents, temperatures,
    /// RPM, and fault status.
    ///
    /// # Returns
    /// MotorTelemetry struct containing all motor data
    ///
    /// # Errors
    /// Returns ConnectionError if the request fails or the data cannot be parsed
    pub async fn get_values(&mut self) -> Result<MotorTelemetry, ConnectionError> {
        let payload = self.request(Command::CommGetValues, None).await?;

        // Create a DecodedPacket to use the MC_VALUES parsing
        let packet = DecodedPacket::new(Command::CommGetValues, payload);
        
        match packet.parse_mc_values() {
            Ok(telemetry) => Ok(telemetry),
            Err(e) => Err(ConnectionError::Protocol(e)),
        }
    }

    /// Get MC configuration from VESC
    ///
    /// Sends COMM_GET_MCCONF and receives the binary configuration data.
    /// Note: Full binary parsing is complex and varies by firmware version.
    /// This method returns the raw bytes for further processing.
    ///
    /// # Returns
    /// Raw MC configuration bytes
    ///
    /// # Errors
    /// Returns ConnectionError if the request fails
    pub async fn get_mc_config(&mut self) -> Result<Vec<u8>, ConnectionError> {
        self.request(Command::CommGetMcConf, None).await
    }

    /// Set MC configuration on VESC
    ///
    /// Sends COMM_SET_MCCONF with the configuration data.
    /// Note: The configuration data must be in the VESC binary format.
    ///
    /// # Arguments
    /// * `config_data` - Binary configuration data
    ///
    /// # Errors
    /// Returns ConnectionError if the request fails
    pub async fn set_mc_config(&mut self, config_data: &[u8]) -> Result<(), ConnectionError> {
        self.request(Command::CommSetMcConf, Some(config_data)).await?;
        Ok(())
    }

    /// Get APP configuration from VESC
    ///
    /// Sends COMM_GET_APPCONF and receives the binary configuration data.
    ///
    /// # Returns
    /// Raw APP configuration bytes
    ///
    /// # Errors
    /// Returns ConnectionError if the request fails
    pub async fn get_app_config(&mut self) -> Result<Vec<u8>, ConnectionError> {
        self.request(Command::CommGetAppConf, None).await
    }

    /// Set APP configuration on VESC
    ///
    /// Sends COMM_SET_APPCONF with the configuration data.
    ///
    /// # Arguments
    /// * `config_data` - Binary configuration data
    ///
    /// # Errors
    /// Returns ConnectionError if the request fails
    pub async fn set_app_config(&mut self, config_data: &[u8]) -> Result<(), ConnectionError> {
        self.request(Command::CommSetAppConf, Some(config_data)).await?;
        Ok(())
    }

    /// Close the connection
    ///
    /// The serial port is automatically closed when dropped.
    pub async fn close(mut self) -> Result<(), ConnectionError> {
        // Flush any pending writes
        self.port.flush().await.map_err(|e| ConnectionError::Io(e))?;
        // Port will be dropped and closed automatically
        Ok(())
    }
}

/// List all available serial ports
///
/// Returns a list of PortInfo structs containing information
/// about each available serial port.
pub fn list_ports() -> Result<Vec<PortInfo>, ConnectionError> {
    let ports = tokio_serial::available_ports()
        .map_err(|e| ConnectionError::Serial(e))?;

    let port_info: Vec<PortInfo> = ports
        .into_iter()
        .map(|p| {
            let usb_info = p.type_.as_usb_info();
            PortInfo {
                name: p.port_name,
                description: usb_info.map(|usb| usb.description().to_string()),
                manufacturer: usb_info.map(|usb| usb.manufacturer().to_string()),
                serial_number: usb_info.map(|usb| usb.serial_number().to_string()),
            }
        })
        .collect();

    Ok(port_info)
}

/// Auto-detect VESC by trying COMM_FW_VERSION on each port
///
/// This function:
/// 1. Lists all available serial ports
/// 2. Tries to open each port at the default baud rate
/// 3. Sends COMM_FW_VERSION command with a 1-second timeout
/// 4. Returns the first port that responds successfully
///
/// # Returns
/// The name of the detected port, or an error if no VESC was found
pub async fn auto_detect_port() -> Result<String, ConnectionError> {
    let ports = list_ports()?;

    if ports.is_empty() {
        return Err(ConnectionError::PortNotFound("No serial ports available".to_string()));
    }

    for port_info in ports {
        // Try to open the port
        let mut conn = match VescConnection::open(&port_info.name, DEFAULT_BAUD_RATE).await {
            Ok(conn) => conn,
            Err(_) => continue, // Skip ports that can't be opened
        };

        // Try to get firmware version with a short timeout
        conn.set_timeout(Duration::from_secs(1));
        
        match conn.get_firmware_version().await {
            Ok(_) => {
                // Found a VESC!
                return Ok(port_info.name);
            }
            Err(_) => {
                // Not a VESC or not responding, try next port
                continue;
            }
        }
    }

    Err(ConnectionError::PortNotFound(
        "No VESC detected on any serial port".to_string()
    ))
}

/// Auto-detect VESC with specific timeout per port
///
/// Similar to `auto_detect_port` but allows specifying a custom
/// timeout for each port attempt.
pub async fn auto_detect_port_with_timeout(
    per_port_timeout: Duration
) -> Result<String, ConnectionError> {
    let ports = list_ports()?;

    if ports.is_empty() {
        return Err(ConnectionError::PortNotFound("No serial ports available".to_string()));
    }

    for port_info in ports {
        let mut conn = match VescConnection::open(&port_info.name, DEFAULT_BAUD_RATE).await {
            Ok(conn) => conn,
            Err(_) => continue,
        };

        conn.set_timeout(per_port_timeout);
        
        match conn.get_firmware_version().await {
            Ok(_) => return Ok(port_info.name),
            Err(_) => continue,
        }
    }

    Err(ConnectionError::PortNotFound(
        "No VESC detected on any serial port".to_string()
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_connection_error_display() {
        let err = ConnectionError::NoResponse;
        assert!(err.to_string().contains("No response"));

        let err = ConnectionError::Timeout(Duration::from_secs(2));
        assert!(err.to_string().contains("2s"));

        let err = ConnectionError::PortNotFound("COM99".to_string());
        assert!(err.to_string().contains("COM99"));
    }

    #[test]
    fn test_firmware_info() {
        let info = FirmwareInfo {
            version_major: 6,
            version_minor: 2,
            name: "VESCFirmware".to_string(),
            hardware_name: "VESC 100_250".to_string(),
            uuid: [0xa1, 0xb2, 0xc3, 0xd4, 0xe5, 0xf6, 0x00, 0x01, 
                   0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09],
            compile_date: "Jan 15 2024".to_string(),
        };
        
        assert_eq!(info.version_major, 6);
        assert_eq!(info.version_minor, 2);
        assert_eq!(info.name, "VESCFirmware");
        assert_eq!(info.hardware_name, "VESC 100_250");
        assert_eq!(info.uuid[0], 0xa1);
        assert_eq!(info.compile_date, "Jan 15 2024");
    }

    #[test]
    fn test_port_info() {
        let port = PortInfo {
            name: "COM3".to_string(),
            description: Some("USB Serial Port".to_string()),
            manufacturer: Some("STMicroelectronics".to_string()),
            serial_number: Some("123456789".to_string()),
        };
        
        assert_eq!(port.name, "COM3");
        assert_eq!(port.description, Some("USB Serial Port".to_string()));
        assert_eq!(port.manufacturer, Some("STMicroelectronics".to_string()));
        assert_eq!(port.serial_number, Some("123456789".to_string()));
    }
}
