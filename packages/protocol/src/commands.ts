import { MAX_PAYLOAD_LEN, START_BYTE_SHORT, START_BYTE_LONG, STOP_BYTE } from "./constants";
import { payloadTooLong } from "./errors";

/**
 * Command IDs for VESC communication
 * 
 * All 58 commands (0-57) from the VESC binary protocol specification
 */
export enum Command {
  /** Get firmware version (0) */
  CommFwVersion = 0,
  /** Jump to bootloader (1) */
  CommJumpToBootloader = 1,
  /** Erase new app (2) */
  CommEraseNewApp = 2,
  /** Write new app data (3) */
  CommWriteNewAppData = 3,
  /** Get values - telemetry data (4) */
  CommGetValues = 4,
  /** Set duty cycle (5) */
  CommSetDuty = 5,
  /** Set current (6) */
  CommSetCurrent = 6,
  /** Set current brake (7) */
  CommSetCurrentBrake = 7,
  /** Set RPM (8) */
  CommSetRpm = 8,
  /** Set position (9) */
  CommSetPos = 9,
  /** Set handbrake (10) */
  CommSetHandbrake = 10,
  /** Set detect (11) */
  CommSetDetect = 11,
  /** Set servo position (12) */
  CommSetServoPos = 12,
  /** Set motor controller configuration (13) */
  CommSetMcConf = 13,
  /** Get motor controller configuration (14) */
  CommGetMcConf = 14,
  /** Get motor controller default configuration (15) */
  CommGetMcConfDefault = 15,
  /** Set application configuration (16) */
  CommSetAppConf = 16,
  /** Get application configuration (17) */
  CommGetAppConf = 17,
  /** Get application default configuration (18) */
  CommGetAppConfDefault = 18,
  /** Sample print (19) */
  CommSamplePrint = 19,
  /** Terminal command (20) */
  CommTerminalCmd = 20,
  /** Print message (21) */
  CommPrint = 21,
  /** Get rotor position (22) */
  CommRotorPosition = 22,
  /** Experiment sample (23) */
  CommExperimentSample = 23,
  /** Detect motor parameters (24) */
  CommDetectMotorParam = 24,
  /** Detect motor R and L (25) */
  CommDetectMotorR_L = 25,
  /** Detect motor flux linkage (26) */
  CommDetectMotorFluxLinkage = 26,
  /** Detect encoder (27) */
  CommDetectEncoder = 27,
  /** Detect hall FOC (28) */
  CommDetectHallFoc = 28,
  /** Reboot controller (29) */
  CommReboot = 29,
  /** Keep-alive signal (30) */
  CommAlive = 30,
  /** Get decoded PPM signal (31) */
  CommGetDecodedPpm = 31,
  /** Get decoded ADC signal (32) */
  CommGetDecodedAdc = 32,
  /** Get decoded CHUCK (Nunchuk) signal (33) */
  CommGetDecodedChuk = 33,
  /** Forward CAN message (34) */
  CommForwardCan = 34,
  /** Set chuck data (35) */
  CommSetChuckData = 35,
  /** Custom application data (36) */
  CommCustomAppData = 36,
  /** NRF start pairing (37) */
  CommNrfStartPairing = 37,
  /** NRF set MAC address (38) */
  CommNrfSetMacAddr = 38,
  /** NRF set encryption key (39) */
  CommNrfSetEncKey = 39,
  /** NRF set radio channel (40) */
  CommNrfSetRadioChannel = 40,
  /** NRF pairing started (41) */
  CommNrfPairingStarted = 41,
  /** NRF pairing OK (42) */
  CommNrfPairingOk = 42,
  /** NRF pairing failed (43) */
  CommNrfPairingFailed = 43,
  /** IMU calibration (44) */
  CommImuCalibrate = 44,
  /** Lisp set running (45) */
  CommLispSetRunning = 45,
  /** Lisp get stats (46) */
  CommLispGetStats = 46,
  /** Lisp reload (47) */
  CommLispReload = 47,
  /** Get IMU calibration data (48) */
  CommGetImuCalibration = 48,
  /** Get IMU calibration data 6-point (49) */
  CommGetImuCalibration6 = 49,
  /** Get IMU calibration data 9-point (50) */
  CommGetImuCalibration9 = 50,
  /** Lisp read code (51) */
  CommLispRead = 51,
  /** Lisp write code (52) */
  CommLispWrite = 52,
  /** Lisp erase code (53) */
  CommLispErase = 53,
  /** Lisp REPL command (54) */
  CommLispReplCmd = 54,
  /** Lisp stream code (55) */
  CommLispStreamCode = 55,
  /** Get GNSS data (56) */
  CommGetGnss = 56,
  /** Log data F32 (57) */
  CommLogDataF32 = 57,
}

/**
 * Convert command to u8
 */
export function commandToU8(command: Command): number {
  return command as number;
}

/**
 * Try to convert u8 to Command
 * Returns undefined if the value is not a valid command (0-57)
 */
export function commandFromU8(value: number): Command | undefined {
  if (value >= 0 && value <= 57) {
    return value as Command;
  }
  return undefined;
}

/**
 * Get all valid commands (0-57)
 */
export function getAllCommands(): Command[] {
  return Array.from({ length: 58 }, (_, i) => i as Command);
}

/**
 * Validate that a command is valid for encoding
 * Ensures total payload length doesn't exceed MAX_PAYLOAD_LEN
 */
export function validateCommandPayload(command: Command, payload: Uint8Array): void {
  const totalLen = 1 + payload.length; // 1 byte for command + payload
  if (totalLen > MAX_PAYLOAD_LEN) {
    throw payloadTooLong(payload.length);
  }
}
