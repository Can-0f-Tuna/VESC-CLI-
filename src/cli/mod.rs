//! CLI Module
//!
//! This module handles command-line interface components including
//! argument parsing, output formatting, and command execution.
//!
//! ## Design Principles
//!
//! - **Agent-first JSON output**: JSON is the default, no --json flag needed
//! - **HATEOAS**: Every response includes `next_actions` for discoverability
//! - **Self-documenting**: `veac schema` returns complete command tree
//! - **Noun-verb pattern**: Commands organized as `<noun> <verb>` (e.g., `motor set-rpm`)
//! - **Context-protecting**: Large outputs trigger warnings

pub mod args;
pub mod output;

// Re-export commonly used items
pub use args::{Cli, Commands, DeviceArgs, DeviceCommands, MotorArgs, MotorCommands, ConfigArgs, ConfigCommands, OutputFormat};
pub use output::{OutputManager, NextAction, CliResponse, ErrorResponse, MotorValuesOutput};
