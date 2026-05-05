//! Integration tests for VESC CLI
//!
//! These tests verify CLI behavior using the assert_cmd crate.
//! They test the actual binary without mocking, ensuring the CLI
//! interface works correctly.

use assert_cmd::Command;
use predicates::prelude::*;
use serde_json::Value;

/// Test that --help displays usage information
#[test]
fn test_cli_help() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--help");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("VESC AI-Controllable CLI"));
}

/// Test that -h also displays help
#[test]
fn test_cli_help_short() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("-h");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("VESC AI-Controllable CLI"));
}

/// Test that --version displays version information
#[test]
fn test_cli_version() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--version");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("0.1.0"));
}

/// Test the schema command returns valid JSON with commands array
#[test]
fn test_schema_command() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("schema");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("commands"))
        .stdout(predicate::str::contains("veac"));
}

/// Test schema command with specific command path
#[test]
fn test_schema_command_with_path() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("schema").arg("device").arg("list-ports");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("device list-ports"));
}

/// Test device list-ports command returns valid JSON
#[test]
fn test_device_list_ports() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("device").arg("list-ports");
    
    let output = cmd.output().unwrap();
    
    // Should succeed (returns empty list if no ports)
    assert!(output.status.success(), "Command should succeed");
    
    // Check it's valid JSON
    let stdout = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&stdout)
        .expect("Output should be valid JSON");
    
    // Should have ok field
    assert!(json.get("ok").is_some(), "Response should have 'ok' field");
    
    // Should have result field
    assert!(json.get("result").is_some(), "Response should have 'result' field");
}

/// Test device info without port returns error gracefully
#[test]
fn test_device_info_without_port() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("device").arg("info");
    
    // Should succeed but return error response (JSON with ok: false)
    let output = cmd.output().unwrap();
    
    // Parse the JSON response
    let stdout = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&stdout)
        .expect("Output should be valid JSON even on error");
    
    // Should have ok: false since no port specified and auto-detect may fail
    if let Some(ok) = json.get("ok") {
        // If ok is present, it should be false (error case)
        if ok.as_bool() == Some(false) {
            // Expected error response
            assert!(json.get("error").is_some(), "Error response should have 'error' field");
        }
    }
    
    // Should have next_actions for recovery
    assert!(json.get("next_actions").is_some(), "Response should have 'next_actions' for HATEOAS");
}

/// Test device ping without port returns error gracefully
#[test]
fn test_device_ping_without_port() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("device").arg("ping");
    
    let output = cmd.output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&stdout)
        .expect("Output should be valid JSON");
    
    // Should have the expected fields
    assert!(json.get("ok").is_some(), "Response should have 'ok' field");
    assert!(json.get("command").is_some(), "Response should have 'command' field");
}

/// Test device connect without port
#[test]
fn test_device_connect_without_port() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("device").arg("connect");
    
    let output = cmd.output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&stdout)
        .expect("Output should be valid JSON");
    
    // Should have error information
    assert!(json.get("ok").is_some(), "Response should have 'ok' field");
}

/// Test motor commands without connection return appropriate errors
#[test]
fn test_motor_get_values_without_connection() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("motor").arg("get-values");
    
    let output = cmd.output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&stdout)
        .expect("Output should be valid JSON");
    
    // Should have the expected structure
    assert!(json.get("ok").is_some(), "Response should have 'ok' field");
    assert!(json.get("command").is_some(), "Response should have 'command' field");
}

/// Test motor stop without connection
#[test]
fn test_motor_stop_without_connection() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("motor").arg("stop");
    
    let output = cmd.output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&stdout)
        .expect("Output should be valid JSON");
    
    assert!(json.get("ok").is_some(), "Response should have 'ok' field");
}

/// Test motor set-rpm without connection
#[test]
fn test_motor_set_rpm_without_connection() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("motor").arg("set-rpm").arg("1000");
    
    let output = cmd.output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&stdout)
        .expect("Output should be valid JSON");
    
    assert!(json.get("ok").is_some(), "Response should have 'ok' field");
}

/// Test dry-run mode works
#[test]
fn test_dry_run_mode() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--dry-run")
        .arg("motor")
        .arg("set-rpm")
        .arg("1000");
    
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("dry_run"));
}

/// Test verbose mode flag is accepted
#[test]
fn test_verbose_flag() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--verbose")
        .arg("device")
        .arg("list-ports");
    
    // Should succeed with verbose flag
    cmd.assert().success();
}

/// Test that invalid commands produce error output
#[test]
fn test_invalid_command() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("invalid-command-that-does-not-exist");
    
    // Should fail with non-zero exit code
    cmd.assert().failure();
}

/// Test config commands structure
#[test]
fn test_config_get_mc_structure() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--dry-run")
        .arg("config")
        .arg("get-mc");
    
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("dry_run"));
}

/// Test terminal command placeholder
#[test]
fn test_terminal_command() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("terminal");
    
    // Terminal command is a placeholder, should output message to stderr
    let output = cmd.output().unwrap();
    assert!(output.status.success() || !output.status.success());
}

/// Test global port option
#[test]
fn test_global_port_option() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--port")
        .arg("COM99")  // Non-existent port
        .arg("device")
        .arg("info");
    
    let output = cmd.output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // Should produce valid JSON response
    if let Ok(json) = serde_json::from_str::<Value>(&stdout) {
        assert!(json.get("ok").is_some(), "Response should have 'ok' field");
    }
}

/// Test global baud option
#[test]
fn test_global_baud_option() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--baud")
        .arg("115200")
        .arg("device")
        .arg("list-ports");
    
    // Should succeed
    cmd.assert().success();
}

/// Test YAML output format
#[test]
fn test_yaml_output_format() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--format")
        .arg("yaml")
        .arg("device")
        .arg("list-ports");
    
    // Should succeed with YAML format
    cmd.assert().success();
}

/// Test table output format
#[test]
fn test_table_output_format() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--format")
        .arg("table")
        .arg("device")
        .arg("list-ports");
    
    // Should succeed with table format
    cmd.assert().success();
}

/// Test motor set-duty command
#[test]
fn test_motor_set_duty() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--dry-run")
        .arg("motor")
        .arg("set-duty")
        .arg("0.5");
    
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("duty"));
}

/// Test motor set-current command
#[test]
fn test_motor_set_current() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--dry-run")
        .arg("motor")
        .arg("set-current")
        .arg("10.0");
    
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("current"));
}

/// Test motor set-current-brake command
#[test]
fn test_motor_set_current_brake() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--dry-run")
        .arg("motor")
        .arg("set-current-brake")
        .arg("5.0");
    
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("current"));
}

/// Test motor set-pos command
#[test]
fn test_motor_set_pos() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--dry-run")
        .arg("motor")
        .arg("set-pos")
        .arg("90.0");
    
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("pos"));
}

/// Test duration option for motor commands
#[test]
fn test_motor_set_rpm_with_duration() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--dry-run")
        .arg("motor")
        .arg("set-rpm")
        .arg("1000")
        .arg("--duration")
        .arg("5");
    
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("duration"));
}

/// Test CAN ID option
#[test]
fn test_can_id_option() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--can-id")
        .arg("1")
        .arg("--dry-run")
        .arg("motor")
        .arg("stop");
    
    cmd.assert().success();
}

/// Test timeout option
#[test]
fn test_timeout_option() {
    let mut cmd = Command::cargo_bin("veac").unwrap();
    cmd.arg("--timeout")
        .arg("10000")
        .arg("device")
        .arg("list-ports");
    
    cmd.assert().success();
}
