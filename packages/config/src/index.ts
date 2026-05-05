/**
 * Configuration Types and Validation for VESC
 * 
 * Defines schemas for Motor Configuration (MCConf) and Application Configuration (AppConf)
 * Based on VESC firmware datatypes.h structures
 */

import { z } from 'zod';

// ============================================================================
// Motor Configuration (MCConf)
// ============================================================================

export const MotorTypeSchema = z.enum([
  'BLDC',      // BLDC motor (six step commutation)
  'DC',        // DC motor
  'FOC',       // Field-Oriented Control
  'GPD'        // General Purpose Drive
]);

export const SensorModeSchema = z.enum([
  'SENSORLESS',
  'SENSORED',
  'HYBRID'
]);

export const PwmModeSchema = z.enum([
  'SYNC',      // Synchronous PWM
  'ASYNC'      // Asynchronous PWM
]);

export const McConfigSchema = z.object({
  // Motor type
  motorType: MotorTypeSchema.default('FOC'),
  
  // Current limits
  lCurrentMax: z.number().default(60.0),
  lCurrentMin: z.number().default(-60.0),
  lInCurrentMax: z.number().default(60.0),
  lInCurrentMin: z.number().default(-60.0),
  lAbsCurrentMax: z.number().default(130.0),
  lSlowAbsCurrent: z.boolean().default(true),
  
  // Voltage limits
  lMinVin: z.number().default(8.0),
  lMaxVin: z.number().default(57.0),
  lBatteryCutStart: z.number().default(10.0),
  lBatteryCutEnd: z.number().default(10.0),
  lBatteryType: z.enum(['LIION_3_0__4_2', 'LIIRON_2_6__3_6', 'LEAD_ACID']).default('LIION_3_0__4_2'),
  lBatteryCells: z.number().int().min(0).max(30).default(3),
  
  // RPM limits
  lRpmMax: z.number().default(100000.0),
  lRpmMin: z.number().default(-100000.0),
  
  // Temperature limits
  lMinDuty: z.number().default(0.005),
  lMaxDuty: z.number().default(0.95),
  
  // PWM settings
  pwmMode: PwmModeSchema.default('SYNC'),
  commMode: z.enum(['COMM_MODE_INTEGRATE', 'COMM_MODE_DELAY']).default('COMM_MODE_INTEGRATE'),
  
  // Sensor settings
  sensorMode: SensorModeSchema.default('SENSORLESS'),
  
  // FOC-specific settings
  focCurrentKp: z.number().default(0.0392),
  focCurrentKi: z.number().default(23.4),
  focFSw: z.number().default(30000.0),
  focDtUs: z.number().default(0.12),
  focEncoderOffset: z.number().default(180.0),
  focEncoderRatio: z.number().default(7.0),
  focEncoderSinGain: z.number().default(1.0),
  focEncoderCosGain: z.number().default(1.0),
  focEncoderSinOffset: z.number().default(1.65),
  focEncoderCosOffset: z.number().default(1.65),
  focEncoderSincosFilter: z.number().default(0.5),
  
  // BLDC-specific settings
  bldcFSwMin: z.number().default(3000.0),
  bldcFSwMax: z.number().default(35000.0),
  
  // DC-specific settings
  dcFSw: z.number().default(25000.0),
  
  // PID controllers
  pSpeedKp: z.number().default(0.004),
  pSpeedKi: z.number().default(0.003),
  pSpeedKd: z.number().default(0.0001),
  pPosKp: z.number().default(0.01),
  pPosKi: z.number().default(0.0),
  pPosKd: z.number().default(0.0),
  
  // Advanced settings
  slMinErpm: z.number().default(150.0),
  slMinErpmCycleIntLimit: z.number().default(1100.0),
  slMaxFbStep: z.number().default(200000.0),
  slCycleIntLimitHighFac: z.number().default(1.01),
  slCycleIntStartRpmBr: z.number().default(80000.0),
  slBrErpmBase: z.number().default(5000.0),
  slCycleIntLimitLowFac: z.number().default(0.95),
  slCycleIntBr: z.number().default(80000.0),
  slBrPosDep: z.boolean().default(false),
  slBrPosKp: z.number().default(100.0),
  
  // Hall sensor settings
  hallTable0: z.number().int().min(0).max(255).default(255),
  hallTable1: z.number().int().min(0).max(255).default(255),
  hallTable2: z.number().int().min(0).max(255).default(255),
  hallTable3: z.number().int().min(0).max(255).default(255),
  hallTable4: z.number().int().min(0).max(255).default(255),
  hallTable5: z.number().int().min(0).max(255).default(255),
  hallTable6: z.number().int().min(0).max(255).default(255),
  hallTable7: z.number().int().min(0).max(255).default(255),
  hallSlErpms: z.number().default(2000.0),
  
  // Misc settings
  minPhaseMargin: z.number().default(50.0),
  maxPhaseMargin: z.number().default(500.0),
});

export type McConfig = z.infer<typeof McConfigSchema>;
export type MotorType = z.infer<typeof MotorTypeSchema>;
export type SensorMode = z.infer<typeof SensorModeSchema>;
export type PwmMode = z.infer<typeof PwmModeSchema>;

// ============================================================================
// Application Configuration (AppConf)
// ============================================================================

export const AppUseSchema = z.enum([
  'NONE',
  'PPM',
  'ADC',
  'UART',
  'PPM_UART',
  'ADC_UART',
  'DUTY',
  'SPEED',
  'TORQUE',
  'BALANCING',
  'PAS',
  'ADC_PAS',
  'ENCODER',
  'NAVAL',
  'TORQUE_DEADBAND',
  'OFF',
  'HW_FALLBACK'
]);

export const AppConfigSchema = z.object({
  // Controller ID
  controllerId: z.number().int().min(0).max(255).default(0),
  
  // Timeout
  timeoutMsec: z.number().default(1000),
  timeoutBrakeCurrent: z.number().default(0.0),
  
  // CAN settings
  canStatusRateHz: z.number().default(50.0),
  canStatusMsgMode: z.enum(['STATUS_1', 'STATUS_1_2', 'STATUS_1_2_3', 'STATUS_1_2_3_4', 'STATUS_1_2_3_4_5']).default('STATUS_1_2_3_4_5'),
  
  // Control modes
  throttleExp: z.number().min(-3).max(3).default(0.0),
  throttleExpBrake: z.number().min(-3).max(3).default(0.0),
  throttleExpMode: z.enum(['POLY', 'NATURAL', 'EXP']).default('NATURAL'),
  
  // Smart reverse
  smartReverseMaxRpm: z.number().default(1500.0),
  smartReverseMaxDuty: z.number().default(0.09),
  
  // PPM settings
  appPpmCtrlType: z.enum([
    'NONE', 'CURRENT', 'CURRENT_NOREV', 'CURRENT_NOREV_BRAKE',
    'DUTY', 'DUTY_NOREV', 'PID', 'PID_NOREV', 'CURRENT_BRAKE_REV_HYST',
    'CURRENT_NOREV_HYST', 'CURRENT_NOREV_BRAKE_HYST', 'CURRENT_HYST',
    'CURRENT_BRAKE_HYST', 'CURRENT_BRAKE_REV_ADAP', 'CURRENT_NOREV_ADAP',
    'CURRENT_BRAKE_ADAP', 'CURRENT_NOREV_BRAKE_ADAP', 'CURRENT_MINI',
    'CURRENT_BRAKE_MINI'
  ]).default('CURRENT_NOREV'),
  appPpmPidMaxErpm: z.number().default(15000.0),
  appPpmHyst: z.number().default(0.15),
  appPpmPulseStart: z.number().default(1.0),
  appPpmPulseEnd: z.number().default(2.0),
  appPpmPulseCenter: z.number().default(1.5),
  appPpmMedianFilter: z.boolean().default(true),
  appPpmSafeStart: z.enum(['OFF', 'ON', 'ALWAYS']).default('ON'),
  appPpmRpmLimStart: z.number().default(1500.0),
  appPpmRpmLimEnd: z.number().default(15000.0),
  appPpmMultiRpm: z.boolean().default(false),
  appPpmTc: z.boolean().default(false),
  appPpmTcMaxDiff: z.number().default(3000.0),
  
  // ADC settings
  appAdcCtrlType: z.enum([
    'NONE', 'CURRENT', 'CURRENT_REV_CENTER', 'CURRENT_REV_BUTTON',
    'CURRENT_REV_BUTTON_BRAKE_CENTER', 'CURRENT_REV_BUTTON_BRAKE_ADC',
    'CURRENT_NOREV_BRAKE_CENTER', 'CURRENT_NOREV_BRAKE_ADC',
    'CURRENT_NOREV_BRAKE_BUTTON', 'DUTY', 'DUTY_REV_CENTER', 'DUTY_REV_BUTTON',
    'PID', 'PID_REV_CENTER', 'PID_REV_BUTTON', 'TORQUE', 'TORQUE_REV_CENTER',
    'TORQUE_REV_BUTTON'
  ]).default('CURRENT_REV_CENTER'),
  appAdcDecayTime: z.number().default(1000.0),
  appAdcMinVoltage: z.number().default(0.0),
  appAdcMaxVoltage: z.number().default(3.3),
  appAdcCenterVoltage: z.number().default(1.65),
  appAdcHyst: z.number().default(0.15),
  appAdcVoltageMin: z.number().default(0.0),
  appAdcVoltageMax: z.number().default(3.3),
  appAdcInputMode: z.enum(['ADC_CTRL_TYPE_ADC', 'ADC_CTRL_TYPE_UART', 'ADC_CTRL_TYPE_PPM']).default('ADC_CTRL_TYPE_ADC'),
  appAdcRevButtonInverted: z.boolean().default(false),
  appAdcSafeStart: z.boolean().default(true),
  appAdcIccButtons: z.boolean().default(false),
  appAdcButton1Pin: z.number().int().min(-1).max(63).default(-1),
  appAdcButton2Pin: z.number().int().min(-1).max(63).default(-1),
  appAdcButtonInverted: z.boolean().default(false),
  appAdcButton1Bitrate: z.number().default(100.0),
  appAdcButton2Bitrate: z.number().default(100.0),
  appAdcButton1Fstopoff: z.number().default(0.0),
  appAdcButton2Fstartinj: z.number().default(0.0),
  
  // UART settings
  appUartBaudRate: z.number().default(115200),
  
  // IMU settings
  imuType: z.enum(['OFF', 'INTERNAL', 'EXTERNAL_MPU9150', 'EXTERNAL_MPU9250', 'EXTERNAL_BMI160', 'EXTERNAL_ICM20948']).default('OFF'),
  imuAhrsMode: z.enum(['MADGWICK', 'MAHONY', 'MADGWICK_F', 'MAHONY_F', 'MADGWICK_R', 'MAHONY_R']).default('MADGWICK'),
  imuSampleRateHz: z.number().default(1000.0),
  imuAccelConfidenceDecay: z.number().default(1.0),
  imuMahonyKp: z.number().default(0.3),
  imuMahonyKi: z.number().default(0.0),
  imuMadgwickBeta: z.number().default(0.1),
  imuRotRoll: z.number().default(0.0),
  imuRotPitch: z.number().default(0.0),
  imuRotYaw: z.number().default(0.0),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type AppUse = z.infer<typeof AppUseSchema>;

// ============================================================================
// Configuration Validation
// ============================================================================

export function validateMcConfig(data: unknown): { success: true; data: McConfig } | { success: false; errors: z.ZodError } {
  const result = McConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateAppConfig(data: unknown): { success: true; data: AppConfig } | { success: false; errors: z.ZodError } {
  const result = AppConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// ============================================================================
// Configuration Defaults
// ============================================================================

export function createDefaultMcConfig(): McConfig {
  return McConfigSchema.parse({});
}

export function createDefaultAppConfig(): AppConfig {
  return AppConfigSchema.parse({});
}

// ============================================================================
// Configuration Backup/Restore
// ============================================================================

export interface ConfigBackup {
  version: string;
  timestamp: string;
  mcConfig: McConfig;
  appConfig: AppConfig;
  metadata?: {
    deviceName?: string;
    firmwareVersion?: string;
    description?: string;
  };
}

export const ConfigBackupSchema = z.object({
  version: z.string(),
  timestamp: z.string(),
  mcConfig: McConfigSchema,
  appConfig: AppConfigSchema,
  metadata: z.object({
    deviceName: z.string().optional(),
    firmwareVersion: z.string().optional(),
    description: z.string().optional()
  }).optional()
});

export function validateBackup(data: unknown): { success: true; data: ConfigBackup } | { success: false; errors: z.ZodError } {
  const result = ConfigBackupSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function createBackup(
  mcConfig: McConfig,
  appConfig: AppConfig,
  metadata?: ConfigBackup['metadata']
): ConfigBackup {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mcConfig,
    appConfig,
    metadata
  };
}

// ============================================================================
// Configuration Serialization (XML for VESC compatibility)
// ============================================================================

export function mcConfigToXml(config: McConfig): string {
  // TODO: Implement XML serialization matching VESC format
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<MCConfiguration>',
    `  <motor_type>${config.motorType}</motor_type>`,
    `  <l_current_max>${config.lCurrentMax}</l_current_max>`,
    `  <l_current_min>${config.lCurrentMin}</l_current_min>`,
    `  <l_in_current_max>${config.lInCurrentMax}</l_in_current_max>`,
    `  <l_in_current_min>${config.lInCurrentMin}</l_in_current_min>`,
    `  <l_abs_current_max>${config.lAbsCurrentMax}</l_abs_current_max>`,
    `  <l_min_vin>${config.lMinVin}</l_min_vin>`,
    `  <l_max_vin>${config.lMaxVin}</l_max_vin>`,
    `  <l_battery_cut_start>${config.lBatteryCutStart}</l_battery_cut_start>`,
    `  <l_battery_cut_end>${config.lBatteryCutEnd}</l_battery_cut_end>`,
    `  <l_rpm_max>${config.lRpmMax}</l_rpm_max>`,
    `  <l_rpm_min>${config.lRpmMin}</l_rpm_min>`,
    `  <l_min_duty>${config.lMinDuty}</l_min_duty>`,
    `  <l_max_duty>${config.lMaxDuty}</l_max_duty>`,
    `  <foc_current_kp>${config.focCurrentKp}</foc_current_kp>`,
    `  <foc_current_ki>${config.focCurrentKi}</foc_current_ki>`,
    '</MCConfiguration>'
  ];
  
  return lines.join('\n');
}

export function appConfigToXml(config: AppConfig): string {
  // TODO: Implement XML serialization matching VESC format
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<APPConfiguration>',
    `  <controller_id>${config.controllerId}</controller_id>`,
    `  <timeout_msec>${config.timeoutMsec}</timeout_msec>`,
    `  <timeout_brake_current>${config.timeoutBrakeCurrent}</timeout_brake_current>`,
    `  <app_ppm_ctrl_type>${config.appPpmCtrlType}</app_ppm_ctrl_type>`,
    `  <app_adc_ctrl_type>${config.appAdcCtrlType}</app_adc_ctrl_type>`,
    '</APPConfiguration>'
  ];
  
  return lines.join('\n');
}

export { z };
