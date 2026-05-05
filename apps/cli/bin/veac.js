#!/usr/bin/env node
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Ensure native modules are available
try {
  require('serialport');
} catch (e) {
  console.error('Error: serialport package not found. Please run "bun install".');
  process.exit(1);
}

import('../dist/index.js');
