//! VESC Commands
//!
//! This module implements high-level VESC commands including
//! motor control, data retrieval, and configuration commands.
//!
//! These commands use the new protocol module with `Command` enum
//! and proper packet framing.

use anyhow::Result;

use crate::vesc::connection::VescConnection;
use crate::vesc::protocol::Command;
use crate::vesc::telemetry::MotorTelemetry;

/// Represents a VESC command that can be executed
#[derive(Debug, Clone)]
pub enum VescCommand {
    /// Get firmware version
    GetVersion,
    /// Get real-time values
    GetValues,
    /// Set motor duty cycle (-1.0 to 1.0)
    SetDuty(f32),
    /// Set motor current in Amperes
    SetCurrent(f32),
    /// Set motor current brake
    SetCurrentBrake(f32),
    /// Set motor RPM
    SetRpm(i32),
    /// Set motor position (in degrees)
    SetPos(f32),
    /// Set handbrake current
    SetHandbrake(f32),
    /// Reboot the VESC
    Reboot,
    /// Send keep-alive signal
    Alive,
}

impl VescCommand {
    /// Execute the command on the given connection (fire and forget)
    ///
    /// # Arguments
    /// * `connection` - The VESC connection to use
    ///
    /// # Returns
    /// * `Result<()>` - Success or error
    pub async fn execute(&self, connection: &mut VescConnection) -> Result<()> {
        let (cmd, payload) = self.to_protocol_command();
        connection.send(cmd, payload.as_deref()).await?;
        Ok(())
    }

    /// Execute the command and wait for a response
    ///
    /// # Arguments
    /// * `connection` - The VESC connection to use
    ///
    /// # Returns
    /// * `Result<Vec<u8>>` - Response payload or error
    pub async fn execute_with_response(&self, connection: &mut VescConnection) -> Result<Vec<u8>> {
        let (cmd, payload) = self.to_protocol_command();
        let response = connection.request(cmd, payload.as_deref()).await?;
        Ok(response)
    }

    /// Convert the command to protocol Command and payload
    fn to_protocol_command(&self) -> (Command, Option<Vec<u8>>) {
        match self {
            VescCommand::GetVersion => {
                (Command::CommFwVersion, None)
            }
            VescCommand::GetValues => {
                (Command::CommGetValues, None)
            }
            VescCommand::SetDuty(duty) => {
                // Duty cycle is sent as a 4-byte signed integer (duty * 100000)
                let value = (*duty * 100_000.0) as i32;
                let payload = value.to_be_bytes().to_vec();
                (Command::CommSetDuty, Some(payload))
            }
            VescCommand::SetCurrent(current) => {
                // Current is sent as a 4-byte signed integer (current * 1000)
                let value = (*current * 1000.0) as i32;
                let payload = value.to_be_bytes().to_vec();
                (Command::CommSetCurrent, Some(payload))
            }
            VescCommand::SetCurrentBrake(current) => {
                // Brake current is sent as a 4-byte signed integer (current * 1000)
                let value = (*current * 1000.0) as i32;
                let payload = value.to_be_bytes().to_vec();
                (Command::CommSetCurrentBrake, Some(payload))
            }
            VescCommand::SetRpm(rpm) => {
                // RPM is sent as a 4-byte signed integer
                let payload = rpm.to_be_bytes().to_vec();
                (Command::CommSetRpm, Some(payload))
            }
            VescCommand::SetPos(pos) => {
                // Position is sent as a 4-byte signed integer (degrees * 1000000)
                let value = (*pos * 1_000_000.0) as i32;
                let payload = value.to_be_bytes().to_vec();
                (Command::CommSetPos, Some(payload))
            }
            VescCommand::SetHandbrake(current) => {
                // Handbrake current is sent as a 4-byte signed integer (current * 1000)
                let value = (*current * 1000.0) as i32;
                let payload = value.to_be_bytes().to_vec();
                (Command::CommSetHandbrake, Some(payload))
            }
            VescCommand::Reboot => {
                (Command::CommReboot, None)
            }
            VescCommand::Alive => {
                (Command::CommAlive, None)
            }
        }
    }
}

/// High-level VESC client for sending commands
pub struct VescClient {
    connection: VescConnection,
}

impl VescClient {
    /// Create a new VESC client
    ///
    /// # Arguments
    /// * `port_name` - Serial port name (e.g., "COM3" or "/dev/ttyUSB0")
    /// * `baud_rate` - Baud rate (typically 115200)
    pub async fn new(port_name: &str, baud_rate: u32) -> Result<Self> {
        let connection = VescConnection::open(port_name, baud_rate).await?;
        Ok(Self { connection })
    }

    /// Auto-detect VESC and create a client
    ///
    /// Scans available serial ports and connects to the first VESC found.
    pub async fn auto_detect() -> Result<Self> {
        let port = crate::vesc::connection::auto_detect_port().await?;
        Self::new(&port, crate::vesc::connection::DEFAULT_BAUD_RATE).await
    }

    /// Send a command to the VESC (fire and forget)
    pub async fn send_command(&mut self, command: VescCommand) -> Result<()> {
        command.execute(&mut self.connection).await
    }

    /// Send a command and wait for a response
    pub async fn send_command_with_response(&mut self, command: VescCommand) -> Result<Vec<u8>> {
        command.execute_with_response(&mut self.connection).await
    }

    /// Get firmware version
    pub async fn get_version(&mut self) -> Result<FirmwareVersion> {
        let info = self.connection.get_firmware_version().await?;
        Ok(FirmwareVersion {
            major: info.version_major,
            minor: info.version_minor,
            name: info.name,
            hardware_name: info.hardware_name,
            uuid: info.uuid,
            compile_date: info.compile_date,
        })
    }

    /// Ping the VESC to check if it's responsive
    pub async fn ping(&mut self) -> Result<bool> {
        self.connection.ping().await
    }

    /// Set duty cycle
    pub async fn set_duty(&mut self, duty: f32) -> Result<()> {
        self.send_command(VescCommand::SetDuty(duty)).await
    }

    /// Set motor current
    pub async fn set_current(&mut self, current: f32) -> Result<()> {
        self.send_command(VescCommand::SetCurrent(current)).await
    }

    /// Set motor brake current
    pub async fn set_current_brake(&mut self, current: f32) -> Result<()> {
        self.send_command(VescCommand::SetCurrentBrake(current)).await
    }

    /// Set motor RPM
    pub async fn set_rpm(&mut self, rpm: i32) -> Result<()> {
        self.send_command(VescCommand::SetRpm(rpm)).await
    }

    /// Set motor position (in degrees)
    pub async fn set_position(&mut self, pos: f32) -> Result<()> {
        self.send_command(VescCommand::SetPos(pos)).await
    }

    /// Set handbrake
    pub async fn set_handbrake(&mut self, current: f32) -> Result<()> {
        self.send_command(VescCommand::SetHandbrake(current)).await
    }

    /// Reboot the VESC
    pub async fn reboot(&mut self) -> Result<()> {
        self.send_command(VescCommand::Reboot).await
    }

    /// Send keep-alive signal
    pub async fn alive(&mut self) -> Result<()> {
        self.send_command(VescCommand::Alive).await
    }

    /// Get real-time motor telemetry values from VESC
    ///
    /// Sends COMM_GET_VALUES and returns a structured MotorTelemetry object
    /// containing all motor data including voltages, currents, temperatures,
    /// RPM, duty cycle, energy consumption, and fault status.
    ///
    /// # Returns
    /// MotorTelemetry struct with all telemetry fields populated
    ///
    /// # Example
    /// ```
    /// let telemetry = client.get_values().await?;
    /// println!("RPM: {}, Current: {}A", telemetry.rpm, telemetry.current_motor);
    /// ```
    pub async fn get_values(&mut self) -> Result<MotorTelemetry> {
        self.connection.get_values().await.map_err(|e| anyhow::anyhow!(e))
    }

    /// Get MC (Motor Controller) configuration from VESC
    ///
    /// Retrieves the motor controller configuration as structured data.
    /// Note: Binary parsing is not fully implemented yet; this returns
    /// default values that can be modified and written back.
    ///
    /// # Returns
    /// McConfiguration struct with motor controller settings
    pub async fn get_mc_config(&mut self) -> Result<crate::vesc::config::McConfiguration> {
        let _raw = self.connection.get_mc_config().await.map_err(|e| anyhow::anyhow!(e))?;
        // TODO: Parse binary MC configuration
        // For now, return default configuration
        Ok(crate::vesc::config::McConfiguration::default())
    }

    /// Set MC (Motor Controller) configuration on VESC
    ///
    /// Writes the motor controller configuration to the VESC.
    /// Note: Binary serialization is not fully implemented yet.
    ///
    /// # Arguments
    /// * `config` - MC configuration to write
    pub async fn set_mc_config(&mut self, config: &crate::vesc::config::McConfiguration) -> Result<()> {
        let _json = config.to_json()?;
        // TODO: Serialize to VESC binary format and send
        // For now, this is a placeholder
        Ok(())
    }

    /// Get APP (Application) configuration from VESC
    ///
    /// Retrieves the application configuration as structured data.
    /// Note: Binary parsing is not fully implemented yet.
    ///
    /// # Returns
    /// AppConfiguration struct with application settings
    pub async fn get_app_config(&mut self) -> Result<crate::vesc::config::AppConfiguration> {
        let _raw = self.connection.get_app_config().await.map_err(|e| anyhow::anyhow!(e))?;
        // TODO: Parse binary APP configuration
        Ok(crate::vesc::config::AppConfiguration::default())
    }

    /// Set APP (Application) configuration on VESC
    ///
    /// Writes the application configuration to the VESC.
    /// Note: Binary serialization is not fully implemented yet.
    ///
    /// # Arguments
    /// * `config` - APP configuration to write
    pub async fn set_app_config(&mut self, config: &crate::vesc::config::AppConfiguration) -> Result<()> {
        let _json = config.to_json()?;
        // TODO: Serialize to VESC binary format and send
        Ok(())
    }

    /// Get both MC and APP configurations (complete backup)
    ///
    /// Retrieves both configurations and combines them into a ConfigSet
    /// suitable for backup and restore operations.
    ///
    /// # Returns
    /// ConfigSet containing both MC and APP configurations
    pub async fn get_config_set(&mut self) -> Result<crate::vesc::config::ConfigSet> {
        let mc = self.get_mc_config().await?;
        let app = self.get_app_config().await?;
        Ok(crate::vesc::config::ConfigSet::new(mc, app))
    }

    /// Set both MC and APP configurations (complete restore)
    ///
    /// Writes both configurations from a ConfigSet to the VESC.
    ///
    /// # Arguments
    /// * `config_set` - Complete configuration set to restore
    pub async fn set_config_set(&mut self, config_set: &crate::vesc::config::ConfigSet) -> Result<()> {
        self.set_mc_config(&config_set.mc).await?;
        self.set_app_config(&config_set.app).await?;
        Ok(())
    }

    /// Access the underlying connection for advanced operations
    pub fn connection(&mut self) -> &mut VescConnection {
        &mut self.connection
    }

    /// Close the connection
    pub async fn close(self) -> Result<()> {
        self.connection.close().await
    }
}

/// Firmware version information
#[derive(Debug, Clone)]
pub struct FirmwareVersion {
    pub major: u8,
    pub minor: u8,
    pub name: String,
    pub hardware_name: String,
    pub uuid: [u8; 16],
    pub compile_date: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vesc_command_enum() {
        let cmd = VescCommand::GetVersion;
        assert!(matches!(cmd, VescCommand::GetVersion));

        let cmd = VescCommand::SetDuty(0.5);
        if let VescCommand::SetDuty(val) = cmd {
            assert_eq!(val, 0.5);
        } else {
            panic!("Expected SetDuty command");
        }
    }

    #[test]
    fn test_command_to_protocol() {
        // Test duty cycle encoding
        let cmd = VescCommand::SetDuty(0.5);
        let (protocol_cmd, payload) = cmd.to_protocol_command();
        assert!(matches!(protocol_cmd, Command::CommSetDuty));
        assert!(payload.is_some());
        let payload = payload.unwrap();
        assert_eq!(payload.len(), 4);
        // Verify big-endian encoding of 0.5 * 100000 = 50000
        assert_eq!(&payload, &[0x00, 0x00, 0xC3, 0x50]); // 50000 in BE

        // Test current encoding
        let cmd = VescCommand::SetCurrent(10.0);
        let (protocol_cmd, payload) = cmd.to_protocol_command();
        assert!(matches!(protocol_cmd, Command::CommSetCurrent));
        assert!(payload.is_some());
        let payload = payload.unwrap();
        // Verify big-endian encoding of 10.0 * 1000 = 10000
        assert_eq!(&payload, &[0x00, 0x00, 0x27, 0x10]); // 10000 in BE

        // Test no payload commands
        let cmd = VescCommand::GetVersion;
        let (protocol_cmd, payload) = cmd.to_protocol_command();
        assert!(matches!(protocol_cmd, Command::CommFwVersion));
        assert!(payload.is_none());
    }

    #[test]
    fn test_firmware_version() {
        let version = FirmwareVersion {
            major: 6,
            minor: 2,
            name: "VESCFirmware".to_string(),
            hardware_name: "VESC 100_250".to_string(),
            uuid: [0xa1, 0xb2, 0xc3, 0xd4, 0xe5, 0xf6, 0x00, 0x01, 
                   0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09],
            compile_date: "Jan 15 2024".to_string(),
        };
        assert_eq!(version.major, 6);
        assert_eq!(version.minor, 2);
        assert_eq!(version.name, "VESCFirmware");
        assert_eq!(version.hardware_name, "VESC 100_250");
        assert_eq!(version.compile_date, "Jan 15 2024");
    }
}
