import { MAX_PAYLOAD_LEN } from "./constants";
import { payloadTooLong } from "./errors";

/**
 * Command IDs for VESC communication
 *
 * Full official VESC protocol (COMM_PACKET_ID) from datatypes.h.
 * All 160 command IDs (0-159) with TypeScript-friendly camelCase names.
 */
export enum Command {
  // Base commands (0-37)
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

  // GPD commands (38-46)
  /** GPD set FSW (38) */
  CommGpdSetFsw = 38,
  /** GPD buffer notify (39) */
  CommGpdBufferNotify = 39,
  /** GPD buffer size left (40) */
  CommGpdBufferSizeLeft = 40,
  /** GPD fill buffer (41) */
  CommGpdFillBuffer = 41,
  /** GPD output sample (42) */
  CommGpdOutputSample = 42,
  /** GPD set mode (43) */
  CommGpdSetMode = 43,
  /** GPD fill buffer int8 (44) */
  CommGpdFillBufferInt8 = 44,
  /** GPD fill buffer int16 (45) */
  CommGpdFillBufferInt16 = 45,
  /** GPD set buffer int scale (46) */
  CommGpdSetBufferIntScale = 46,

  // Extended values & NRF (47-56)
  /** Get values setup (47) */
  CommGetValuesSetup = 47,
  /** Set motor controller configuration temp (48) */
  CommSetMcConfTemp = 48,
  /** Set motor controller configuration temp setup (49) */
  CommSetMcConfTempSetup = 49,
  /** Get values selective (50) */
  CommGetValuesSelective = 50,
  /** Get values setup selective (51) */
  CommGetValuesSetupSelective = 51,
  /** EXT NRF present (52) */
  CommExtNrfPresent = 52,
  /** EXT NRF ESB set channel address (53) */
  CommExtNrfEsbSetChAddr = 53,
  /** EXT NRF ESB send data (54) */
  CommExtNrfEsbSendData = 54,
  /** EXT NRF ESB RX data (55) */
  CommExtNrfEsbRxData = 55,
  /** EXT NRF set enabled (56) */
  CommExtNrfSetEnabled = 56,

  // Detection & CAN (57-64)
  /** Detect motor flux linkage openloop (57) */
  CommDetectMotorFluxLinkageOpenloop = 57,
  /** Detect apply all FOC (58) */
  CommDetectApplyAllFoc = 58,
  /** Jump to bootloader all CAN (59) */
  CommJumpToBootloaderAllCan = 59,
  /** Erase new app all CAN (60) */
  CommEraseNewAppAllCan = 60,
  /** Write new app data all CAN (61) */
  CommWriteNewAppDataAllCan = 61,
  /** Ping CAN (62) */
  CommPingCan = 62,
  /** App disable output (63) */
  CommAppDisableOutput = 63,
  /** Terminal command sync (64) */
  CommTerminalCmdSync = 64,

  // IMU & Bootloader manager (65-74)
  /** Get IMU data (65) */
  CommGetImuData = 65,
  /** Bootloader manager connect (66) */
  CommBmConnect = 66,
  /** Bootloader manager erase flash all (67) */
  CommBmEraseFlashAll = 67,
  /** Bootloader manager write flash (68) */
  CommBmWriteFlash = 68,
  /** Bootloader manager reboot (69) */
  CommBmReboot = 69,
  /** Bootloader manager disconnect (70) */
  CommBmDisconnect = 70,
  /** Bootloader manager map pins default (71) */
  CommBmMapPinsDefault = 71,
  /** Bootloader manager map pins NRF5X (72) */
  CommBmMapPinsNrf5x = 72,
  /** Erase bootloader (73) */
  CommEraseBootloader = 73,
  /** Erase bootloader all CAN (74) */
  CommEraseBootloaderAllCan = 74,

  // Plotting & balance (75-79)
  /** Plot init (75) */
  CommPlotInit = 75,
  /** Plot data (76) */
  CommPlotData = 76,
  /** Plot add graph (77) */
  CommPlotAddGraph = 77,
  /** Plot set graph (78) */
  CommPlotSetGraph = 78,
  /** Get decoded balance (79) */
  CommGetDecodedBalance = 79,

  // Memory & compression (80-83)
  /** Bootloader manager memory read (80) */
  CommBmMemRead = 80,
  /** Write new app data LZO (81) */
  CommWriteNewAppDataLzo = 81,
  /** Write new app data all CAN LZO (82) */
  CommWriteNewAppDataAllCanLzo = 82,
  /** Bootloader manager write flash LZO (83) */
  CommBmWriteFlashLzo = 83,

  // Current, CAN, battery, BLE (84-89)
  /** Set current relative (84) */
  CommSetCurrentRel = 84,
  /** CAN forward frame (85) */
  CommCanFwdFrame = 85,
  /** Set battery cut (86) */
  CommSetBatteryCut = 86,
  /** Set BLE name (87) */
  CommSetBleName = 87,
  /** Set BLE pin (88) */
  CommSetBlePin = 88,
  /** Set CAN mode (89) */
  CommSetCanMode = 89,

  // IMU calibration & temp config (90-91)
  /** Get IMU calibration (90) */
  CommGetImuCalibration = 90,
  /** Get motor controller configuration temp (91) */
  CommGetMcConfTemp = 91,

  // Custom configuration (92-95)
  /** Get custom configuration XML (92) */
  CommGetCustomConfigXml = 92,
  /** Get custom configuration (93) */
  CommGetCustomConfig = 93,
  /** Get custom configuration default (94) */
  CommGetCustomConfigDefault = 94,
  /** Set custom configuration (95) */
  CommSetCustomConfig = 95,

  // BMS commands (96-101)
  /** BMS get values (96) */
  CommBmsGetValues = 96,
  /** BMS set charge allowed (97) */
  CommBmsSetChargeAllowed = 97,
  /** BMS set balance override (98) */
  CommBmsSetBalanceOverride = 98,
  /** BMS reset counters (99) */
  CommBmsResetCounters = 99,
  /** BMS force balance (100) */
  CommBmsForceBalance = 100,
  /** BMS zero current offset (101) */
  CommBmsZeroCurrentOffset = 101,

  // Firmware update HW commands (102-109)
  /** Jump to bootloader HW (102) */
  CommJumpToBootloaderHw = 102,
  /** Erase new app HW (103) */
  CommEraseNewAppHw = 103,
  /** Write new app data HW (104) */
  CommWriteNewAppDataHw = 104,
  /** Erase bootloader HW (105) */
  CommEraseBootloaderHw = 105,
  /** Jump to bootloader all CAN HW (106) */
  CommJumpToBootloaderAllCanHw = 106,
  /** Erase new app all CAN HW (107) */
  CommEraseNewAppAllCanHw = 107,
  /** Write new app data all CAN HW (108) */
  CommWriteNewAppDataAllCanHw = 108,
  /** Erase bootloader all CAN HW (109) */
  CommEraseBootloaderAllCanHw = 109,

  // Odometer & power switch (110-112)
  /** Set odometer (110) */
  CommSetOdometer = 110,
  /** Power switch get status (111) */
  CommPswGetStatus = 111,
  /** Power switch switch (112) */
  CommPswSwitch = 112,

  // BMS forward & hardware data (113-115)
  /** BMS forward CAN RX (113) */
  CommBmsFwdCanRx = 113,
  /** BMS hardware data (114) */
  CommBmsHwData = 114,
  /** Get battery cut (115) */
  CommGetBatteryCut = 115,

  // Bootloader manager halt & QML UI (116-121)
  /** Bootloader manager halt request (116) */
  CommBmHaltReq = 116,
  /** Get QML UI hardware (117) */
  CommGetQmlUiHw = 117,
  /** Get QML UI app (118) */
  CommGetQmlUiApp = 118,
  /** Custom hardware data (119) */
  CommCustomHwData = 119,
  /** QML UI erase (120) */
  CommQmluiErase = 120,
  /** QML UI write (121) */
  CommQmluiWrite = 121,

  // IO Board (122-124)
  /** IO board get all (122) */
  CommIoBoardGetAll = 122,
  /** IO board set PWM (123) */
  CommIoBoardSetPwm = 123,
  /** IO board set digital (124) */
  CommIoBoardSetDigital = 124,

  // Memory write, BMS selftest, sensors, stats (125-129)
  /** Bootloader manager memory write (125) */
  CommBmMemWrite = 125,
  /** BMS balance selftest (126) */
  CommBmsBlncSelftest = 126,
  /** Get external humidity and temperature (127) */
  CommGetExtHumTmp = 127,
  /** Get stats (128) */
  CommGetStats = 128,
  /** Reset stats (129) */
  CommResetStats = 129,

  // Lisp commands (130-135)
  /** Lisp read code (130) */
  CommLispReadCode = 130,
  /** Lisp write code (131) */
  CommLispWriteCode = 131,
  /** Lisp erase code (132) */
  CommLispEraseCode = 132,
  /** Lisp set running (133) */
  CommLispSetRunning = 133,
  /** Lisp get stats (134) */
  CommLispGetStats = 134,
  /** Lisp print (135) */
  CommLispPrint = 135,

  // BMS battery type (136-137)
  /** BMS set battery type (136) */
  CommBmsSetBattType = 136,
  /** BMS get battery type (137) */
  CommBmsGetBattType = 137,

  // Lisp REPL & stream (138-139)
  /** Lisp REPL command (138) */
  CommLispReplCmd = 138,
  /** Lisp stream code (139) */
  CommLispStreamCode = 139,

  // File system (140-144)
  /** File list (140) */
  CommFileList = 140,
  /** File read (141) */
  CommFileRead = 141,
  /** File write (142) */
  CommFileWrite = 142,
  /** File mkdir (143) */
  CommFileMkdir = 143,
  /** File remove (144) */
  CommFileRemove = 144,

  // Logging (145-148)
  /** Log start (145) */
  CommLogStart = 145,
  /** Log stop (146) */
  CommLogStop = 146,
  /** Log config field (147) */
  CommLogConfigField = 147,
  /** Log data F32 (148) */
  CommLogDataF32 = 148,

  // App config no store & GNSS (149-150)
  /** Set application configuration no store (149) */
  CommSetAppConfNoStore = 149,
  /** Get GNSS data (150) */
  CommGetGnss = 150,

  // Log F64 (151)
  /** Log data F64 (151) */
  CommLogDataF64 = 151,

  // Lisp remote message (152)
  /** Lisp remote message (152) */
  CommLispRmsg = 152,

  // Placeholders for pinlock commands (153-155)
  /** Placeholder for pinlock command 1 (153) */
  CommPinlock1 = 153,
  /** Placeholder for pinlock command 2 (154) */
  CommPinlock2 = 154,
  /** Placeholder for pinlock command 3 (155) */
  CommPinlock3 = 155,

  // Shutdown, FW info, CAN baud, ESTOP (156-159)
  /** Shutdown (156) */
  CommShutdown = 156,
  /** Firmware info (157) */
  CommFwInfo = 157,
  /** CAN update baud all (158) */
  CommCanUpdateBaudAll = 158,
  /** Motor emergency stop (159) */
  CommMotorEstop = 159,

  // ---------------------------------------------------------------------------
  // Backward-compatibility aliases (same value, alternative name)
  // ---------------------------------------------------------------------------
  /** Alias for CommLispWriteCode (131) — used by CLI imports */
  CommLispWrite = 131,
  /** Alias for CommLispEraseCode (132) — used by CLI imports */
  CommLispErase = 132,
}

/**
 * Convert command to u8
 */
export function commandToU8(command: Command): number {
  return command as number;
}

/**
 * Try to convert u8 to Command
 * Returns undefined if the value is not a valid command (0-159)
 */
export function commandFromU8(value: number): Command | undefined {
  if (value >= 0 && value <= 159) {
    return value as Command;
  }
  return undefined;
}

/**
 * Get all valid commands (0-159)
 */
export function getAllCommands(): Command[] {
  return Array.from({ length: 160 }, (_, i) => i as Command);
}

/**
 * Validate that a command is valid for encoding
 * Ensures total payload length doesn't exceed MAX_PAYLOAD_LEN
 */
export function validateCommandPayload(_command: Command, payload: Uint8Array): void {
  const totalLen = 1 + payload.length; // 1 byte for command + payload
  if (totalLen > MAX_PAYLOAD_LEN) {
    throw payloadTooLong(payload.length);
  }
}
