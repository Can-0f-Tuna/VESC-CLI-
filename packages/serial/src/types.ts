/**
 * Type definitions for VESC serial communication
 */

/** Default baud rate for VESC communication */
export const DEFAULT_BAUD_RATE = 115200;

/** Default timeout for operations in milliseconds */
export const DEFAULT_TIMEOUT_MS = 2000;

/** Port information */
export interface PortInfo {
  name: string;
  description?: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  locationId?: string;
  pnpId?: string;
}

/** Firmware information from COMM_FW_VERSION */
export interface FirmwareInfo {
  versionMajor: number;
  versionMinor: number;
  name: string;
  hardwareName: string;
  uuid: Uint8Array; // 16 bytes
  compileDate: string;
}

/** Complete motor telemetry data from COMM_GET_VALUES */
export interface MotorTelemetry {
  // Input/Power
  /** Input voltage in volts (V) */
  vIn: number;
  /** Input current in amperes (A) */
  currentIn: number;
  /** Calculated input power in watts (W) = vIn * currentIn */
  powerIn?: number;

  // Motor
  /** Motor current in amperes (A) */
  currentMotor: number;
  /** Motor RPM (revolutions per minute) */
  rpm: number;
  /** Duty cycle as a ratio (0.0 to 1.0, where 1.0 = 100%) */
  dutyCycle: number;

  // Temperatures
  /** MOSFET temperature in degrees Celsius */
  tempMos: number;
  /** Motor temperature in degrees Celsius */
  tempMotor: number;

  // Currents (FOC - Field Oriented Control)
  /** D-axis current (direct current component) */
  currentId: number;
  /** Q-axis current (quadrature current component) */
  currentIq: number;

  // Energy
  /** Amp-hours consumed since reset */
  ampHours: number;
  /** Amp-hours charged/regenerated since reset */
  ampHoursCharged: number;
  /** Watt-hours consumed since reset */
  wattHours: number;
  /** Watt-hours charged/regenerated since reset */
  wattHoursCharged: number;

  // Position
  /** Tachometer count (signed, tracks direction) */
  tachometer: number;
  /** Absolute tachometer count (always positive) */
  tachometerAbs: number;
  /** Encoder position in degrees (if encoder is available) */
  encoderPosition: number;

  // Status
  /** Active fault code */
  faultCode: FaultCode;
  /** Human-readable fault description */
  faultStr: string;
}

/** VESC fault codes */
export enum FaultCode {
  /** No fault - normal operation */
  None = 0,
  /** Over voltage - input voltage exceeded maximum */
  OverVoltage = 1,
  /** Under voltage - input voltage below minimum */
  UnderVoltage = 2,
  /** DRV8302 driver fault (older VESC hardware) */
  Drv = 3,
  /** Absolute over current - current exceeded absolute maximum */
  AbsOverCurrent = 4,
  /** Over temperature on FETs (MOSFETs) */
  OverTempFet = 5,
  /** Over temperature on motor */
  OverTempMotor = 6,
  /** Gate driver over voltage */
  GateDriverOverVoltage = 7,
  /** Gate driver under voltage */
  GateDriverUnderVoltage = 8,
  /** MCU under voltage */
  McuUnderVoltage = 9,
  /** Booting from watchdog reset */
  BootingFromWatchdog = 10,
  /** Encoder SPI communication fault */
  EncoderSpi = 11,
  /** Encoder SIN/COS amplitude below minimum */
  EncoderSincosLow = 12,
  /** Encoder SIN/COS amplitude above maximum */
  EncoderSincosHigh = 13,
  /** Flash memory corruption detected */
  FlashCorruption = 14,
  /** High offset on current sensor 1 */
  HighOffsetCurrent1 = 15,
  /** High offset on current sensor 2 */
  HighOffsetCurrent2 = 16,
  /** High offset on current sensor 3 */
  HighOffsetCurrent3 = 17,
  /** Unbalanced currents between phases */
  UnbalancedCurrents = 18,
  /** Brake fault */
  Brake = 19,
  /** Resolver LOT (Loss of Tracking) fault */
  ResolverLot = 20,
  /** Resolver DOS (Degradation of Signal) fault */
  ResolverDos = 21,
  /** Resolver LOS (Loss of Signal) fault */
  ResolverLos = 22,
  /** Flash corruption in application configuration */
  FlashCorruptionAppCfg = 23,
  /** Flash corruption in motor controller configuration */
  FlashCorruptionMcCfg = 24,
  /** Encoder no magnet detected */
  EncoderNoMagnet = 25,
  /** Encoder magnet too strong */
  EncoderMagnetTooStrong = 26,
  /** Phase filter fault */
  PhaseFilter = 27,
  /** General encoder fault */
  EncoderFault = 28,
  /** Low voltage output fault */
  LvOutputFault = 29,
  /** Encoder slip detected */
  EncoderSlip = 30,
  /** Overspeed - RPM exceeded maximum */
  Overspeed = 31,
  /** Underspeed - RPM below minimum (for certain modes) */
  Underspeed = 32,
  /** Absolute overspeed - RPM exceeded absolute maximum */
  AbsOverspeed = 33,
}

export namespace FaultCode {
  export function fromU8(code: number): FaultCode {
    if (code >= 0 && code <= 33) {
      return code as FaultCode;
    }
    return FaultCode.None;
  }

  export function description(fault: FaultCode): string {
    switch (fault) {
      case FaultCode.None:
        return "No fault";
      case FaultCode.OverVoltage:
        return "Over voltage - input voltage too high";
      case FaultCode.UnderVoltage:
        return "Under voltage - input voltage too low";
      case FaultCode.Drv:
        return "DRV driver fault";
      case FaultCode.AbsOverCurrent:
        return "Absolute over current";
      case FaultCode.OverTempFet:
        return "Over temperature - MOSFETs";
      case FaultCode.OverTempMotor:
        return "Over temperature - motor";
      case FaultCode.GateDriverOverVoltage:
        return "Gate driver over voltage";
      case FaultCode.GateDriverUnderVoltage:
        return "Gate driver under voltage";
      case FaultCode.McuUnderVoltage:
        return "MCU under voltage";
      case FaultCode.BootingFromWatchdog:
        return "Booting from watchdog reset";
      case FaultCode.EncoderSpi:
        return "Encoder SPI fault";
      case FaultCode.EncoderSincosLow:
        return "Encoder SIN/COS low amplitude";
      case FaultCode.EncoderSincosHigh:
        return "Encoder SIN/COS high amplitude";
      case FaultCode.FlashCorruption:
        return "Flash corruption";
      case FaultCode.HighOffsetCurrent1:
        return "High offset - current sensor 1";
      case FaultCode.HighOffsetCurrent2:
        return "High offset - current sensor 2";
      case FaultCode.HighOffsetCurrent3:
        return "High offset - current sensor 3";
      case FaultCode.UnbalancedCurrents:
        return "Unbalanced phase currents";
      case FaultCode.Brake:
        return "Brake fault";
      case FaultCode.ResolverLot:
        return "Resolver loss of tracking";
      case FaultCode.ResolverDos:
        return "Resolver degradation of signal";
      case FaultCode.ResolverLos:
        return "Resolver loss of signal";
      case FaultCode.FlashCorruptionAppCfg:
        return "Flash corruption - app config";
      case FaultCode.FlashCorruptionMcCfg:
        return "Flash corruption - motor config";
      case FaultCode.EncoderNoMagnet:
        return "Encoder - no magnet detected";
      case FaultCode.EncoderMagnetTooStrong:
        return "Encoder - magnet too strong";
      case FaultCode.PhaseFilter:
        return "Phase filter fault";
      case FaultCode.EncoderFault:
        return "Encoder fault";
      case FaultCode.LvOutputFault:
        return "Low voltage output fault";
      case FaultCode.EncoderSlip:
        return "Encoder slip detected";
      case FaultCode.Overspeed:
        return "Overspeed - RPM too high";
      case FaultCode.Underspeed:
        return "Underspeed - RPM too low";
      case FaultCode.AbsOverspeed:
        return "Absolute overspeed";
      default:
        return "Unknown fault";
    }
  }

  export function isCritical(fault: FaultCode): boolean {
    return [
      FaultCode.OverVoltage,
      FaultCode.UnderVoltage,
      FaultCode.AbsOverCurrent,
      FaultCode.OverTempFet,
      FaultCode.OverTempMotor,
      FaultCode.FlashCorruption,
      FaultCode.AbsOverspeed,
    ].includes(fault);
  }

  export function isRecoverable(fault: FaultCode): boolean {
    return [
      FaultCode.OverVoltage,
      FaultCode.UnderVoltage,
      FaultCode.OverTempFet,
      FaultCode.OverTempMotor,
      FaultCode.Overspeed,
      FaultCode.Underspeed,
    ].includes(fault);
  }
}

/** Connection configuration */
export interface ConnectionConfig {
  /** Serial port name (e.g., "COM3" on Windows or "/dev/ttyUSB0" on Linux) */
  portName: string;
  /** Baud rate for communication (typically 115200) */
  baudRate: number;
  /** Timeout for operations in milliseconds */
  timeoutMs: number;
}

/** MC Configuration (placeholder for binary config) */
export interface McConfiguration {
  // Placeholder - full binary parsing not implemented yet
  raw?: Uint8Array;
}

/** APP Configuration (placeholder for binary config) */
export interface AppConfiguration {
  // Placeholder - full binary parsing not implemented yet
  raw?: Uint8Array;
}
