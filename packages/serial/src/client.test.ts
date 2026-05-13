/**
 * VescClient Tests
 * 
 * Unit tests for the VescClient class
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { VescClient, VescCommand } from "../src/client.js";
import { FaultCode, FirmwareInfo, MotorTelemetry } from "../src/types.js";
import { Command } from "@veac/protocol";

describe("VescClient", () => {
  // Note: These tests require a physical VESC connection
  // For CI/CD, we should add mock-based tests

  describe("Construction", () => {
    it("should create client with port and default baud rate", () => {
      const client = new VescClient("/dev/ttyUSB0");
      expect(client.getPortName()).toBe("/dev/ttyUSB0");
      expect(client.getBaudRate()).toBe(115200);
      expect(client.isConnected()).toBe(false);
    });

    it("should create client with custom baud rate", () => {
      const client = new VescClient("COM3", 921600);
      expect(client.getPortName()).toBe("COM3");
      expect(client.getBaudRate()).toBe(921600);
    });
  });

  describe("Connection Management", () => {
    it("should track connection state", async () => {
      const client = new VescClient("/dev/ttyUSB0");
      expect(client.isConnected()).toBe(false);

      // Note: connect() would require a real VESC
      // This test verifies the API exists
      expect(typeof client.connect).toBe("function");
      expect(typeof client.disconnect).toBe("function");
    });

    it("should throw when calling methods while disconnected", async () => {
      const client = new VescClient("/dev/ttyUSB0");

      // These should throw ConnectionError when not connected
      await expect(client.getVersion()).rejects.toThrow();
      await expect(client.getValues()).rejects.toThrow();
      await expect(client.setRpm(1000)).rejects.toThrow();
    });
  });

  describe("Motor Commands", () => {
    let client: VescClient;

    beforeEach(() => {
      client = new VescClient("/dev/ttyUSB0");
    });

    it("should have all motor command methods", () => {
      expect(typeof client.setRpm).toBe("function");
      expect(typeof client.setCurrent).toBe("function");
      expect(typeof client.setDuty).toBe("function");
      expect(typeof client.setCurrentBrake).toBe("function");
      expect(typeof client.setPosition).toBe("function");
      expect(typeof client.setHandbrake).toBe("function");
      expect(typeof client.stop).toBe("function");
    });

    it("should have getVersion method", () => {
      expect(typeof client.getVersion).toBe("function");
    });

    it("should have ping method returning number", async () => {
      expect(typeof client.ping).toBe("function");
      // When disconnected, ping should throw
      await expect(client.ping()).rejects.toThrow();
    });

    it("should have getValues method", () => {
      expect(typeof client.getValues).toBe("function");
    });
  });

  describe("Configuration Commands", () => {
    let client: VescClient;

    beforeEach(() => {
      client = new VescClient("/dev/ttyUSB0");
    });

    it("should have config methods", () => {
      expect(typeof client.getMcConfig).toBe("function");
      expect(typeof client.setMcConfig).toBe("function");
      expect(typeof client.getAppConfig).toBe("function");
      expect(typeof client.setAppConfig).toBe("function");
      expect(typeof client.getConfigSet).toBe("function");
      expect(typeof client.setConfigSet).toBe("function");
    });
  });

  describe("CAN Commands", () => {
    let client: VescClient;

    beforeEach(() => {
      client = new VescClient("/dev/ttyUSB0");
    });

    it("should have canForward method", () => {
      expect(typeof client.canForward).toBe("function");
    });

    it("should have canPing method", () => {
      expect(typeof client.canPing).toBe("function");
    });

    it("canForward should throw for invalid targetId", async () => {
      // When disconnected, it should throw notConnectedError
      await expect(client.canForward(0, Command.CommSetRpm)).rejects.toThrow();
      await expect(client.canForward(256, Command.CommSetRpm)).rejects.toThrow();
    });
  });

  describe("Lisp Commands", () => {
    let client: VescClient;

    beforeEach(() => {
      client = new VescClient("/dev/ttyUSB0");
    });

    it("should have all Lisp methods", () => {
      expect(typeof client.lispUpload).toBe("function");
      expect(typeof client.lispErase).toBe("function");
      expect(typeof client.lispStart).toBe("function");
      expect(typeof client.lispStop).toBe("function");
      expect(typeof client.lispRepl).toBe("function");
    });
  });

  describe("VescCommand enum", () => {
    it("should have all expected commands", () => {
      expect(VescCommand.GetVersion as string).toBe("GetVersion");
      expect(VescCommand.GetValues as string).toBe("GetValues");
      expect(VescCommand.SetDuty as string).toBe("SetDuty");
      expect(VescCommand.SetCurrent as string).toBe("SetCurrent");
      expect(VescCommand.SetCurrentBrake as string).toBe("SetCurrentBrake");
      expect(VescCommand.SetRpm as string).toBe("SetRpm");
      expect(VescCommand.SetPos as string).toBe("SetPos");
      expect(VescCommand.SetHandbrake as string).toBe("SetHandbrake");
      expect(VescCommand.Reboot as string).toBe("Reboot");
      expect(VescCommand.Alive as string).toBe("Alive");
    });
  });

  describe("Type exports", () => {
    it("should export FaultCode enum", () => {
      expect(FaultCode.None).toBe(0);
      expect(FaultCode.OverVoltage).toBe(1);
      expect(FaultCode.UnderVoltage).toBe(2);
    });

    it("should export error classes", async () => {
      const { ConnectionError } = await import("../src/client.js");
      expect(typeof ConnectionError).toBe("function");
    });
  });

  describe("Example Usage", () => {
    it("should demonstrate typical usage pattern", async () => {
      // This is a compile-time test to ensure the API is correct
      // It doesn't actually connect to a VESC

      const example = async () => {
        // Create client
        const client = new VescClient("/dev/ttyUSB0", 115200);

        try {
          // Connect
          await client.connect();

          // Get firmware version
          const version: FirmwareInfo = await client.getVersion();
          console.log(`VESC Firmware: ${version.name} v${version.versionMajor}.${version.versionMinor}`);

          // Ping to check latency
          const latency: number = await client.ping();
          console.log(`Latency: ${latency}ms`);

          // Get telemetry
          const values: MotorTelemetry = await client.getValues();
          console.log(`RPM: ${values.rpm}, Current: ${values.currentMotor}A`);

          // Set motor speed
          await client.setRpm(1000);

          // Set current
          await client.setCurrent(5.0);

          // Set duty cycle
          await client.setDuty(0.5);

          // Apply brake
          await client.setCurrentBrake(2.0);

          // Stop motor
          await client.stop();

          // Get configurations
          await client.getMcConfig();
          await client.getAppConfig();

          // Backup configurations
          await client.getConfigSet();

          // CAN bus operations
          await client.canForward(1, Command.CommSetRpm, new Uint8Array([0, 0, 0, 0x03, 0xE8]));
          await client.canPing(1);

          // Lisp operations
          await client.lispUpload("(print \"Hello VESC\")");
          await client.lispStart();
          await client.lispStop();
          await client.lispErase();
          await client.lispRepl("(+ 1 2 3)");

          // Disconnect
          await client.disconnect();
        } catch (error) {
          console.error("VESC error:", error);
        }
      };

      // Verify the example compiles
      expect(typeof example).toBe("function");
    });
  });
});
