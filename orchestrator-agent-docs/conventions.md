# Conventions

## TypeScript Coding Standards

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files/Directories | `kebab-case` | `vesc-protocol`, `motor-commands.ts` |
| Types/Interfaces | `PascalCase` | `VescConnection`, `CommandId` |
| Classes | `PascalCase` | `PacketEncoder`, `SerialConnection` |
| Functions | `camelCase` | `encodePacket`, `getValues` |
| Variables | `camelCase` | `portName`, `baudRate` |
| Constants | `SCREAMING_SNAKE_CASE` | `PACKET_MAX_LEN`, `DEFAULT_BAUD` |
| Enum members | `SCREAMING_SNAKE_CASE` | `COMM_GET_VALUES`, `COMM_SET_RPM` |
| Type parameters | `T`, `K`, `V` | `<T>`, `<K, V>` |
| Private fields | `_camelCase` or `#camelCase` | `_buffer`, `#connection` |

### Code Organization

```typescript
// 1. File header with SPDX license
// SPDX-License-Identifier: GPL-3.0

/**
 * VESC Protocol Implementation
 * 
 * Handles packet framing, CRC calculation, and command serialization.
 */

// 2. Imports (grouped: external, internal)
// External imports
import { SerialPort } from 'serialport';
import { z } from 'zod';
import { ok, err, Result } from 'neverthrow';

// Internal imports (alphabetical)
import { Command } from './commands';
import { McValues } from '@veac/vesc-types';
import { VescError } from './errors';

// 3. Constants
const PACKET_MAX_LEN = 512;
const DEFAULT_BAUD = 115200;

// 4. Type definitions
export type PacketData = Uint8Array;

// 5. Interface definitions
export interface Packet {
  payload: Uint8Array;
}

// 6. Class definitions
export class PacketEncoder {
  private crcTable: Uint16Array;

  constructor() {
    this.crcTable = this.generateCrcTable();
  }

  /**
   * Encode a packet with framing and CRC.
   * 
   * @param payload - The packet payload
   * @returns The encoded packet bytes
   * @throws {VescError} If payload exceeds max length
   */
  encode(payload: Uint8Array): Result<Uint8Array, VescError> {
    if (payload.length > PACKET_MAX_LEN) {
      return err(new VescError('PacketTooLarge', `Payload ${payload.length} exceeds max ${PACKET_MAX_LEN}`));
    }

    const framed = this.addFraming(payload);
    const withCrc = this.addCrc(framed);
    
    return ok(withCrc);
  }

  private addFraming(payload: Uint8Array): Uint8Array {
    // Implementation
  }

  private addCrc(data: Uint8Array): Uint8Array {
    // Implementation
  }

  private generateCrcTable(): Uint16Array {
    // Implementation
  }
}

// 7. Function definitions
/**
 * Calculate CRC16 for VESC protocol.
 * 
 * @param data - The data to checksum
 * @returns The CRC16 value
 */
export function calculateCrc(data: Uint8Array): number {
  // Implementation
  return 0;
}

// 8. Zod schemas (for runtime validation)
export const McValuesSchema = z.object({
  vIn: z.number(),
  tempMos: z.number(),
  tempMotor: z.number(),
  currentMotor: z.number(),
  currentIn: z.number(),
  rpm: z.number(),
  dutyNow: z.number(),
  faultCode: z.number(),
});

export type McValuesValidated = z.infer<typeof McValuesSchema>;

// 9. Export statements (at end of file)
export { PacketEncoder, calculateCrc };
export type { Packet };
```

### Documentation Style

```typescript
/**
 * Brief description of the function.
 * 
 * Longer description explaining what the function does,
 * when to use it, and any important edge cases.
 * 
 * @param param1 - Description of first parameter
 * @param param2 - Description of second parameter
 * @returns Description of the return value
 * @throws {VescError} Description of error conditions
 * 
 * @example
 * ```typescript
 * const result = myFunction(42, 'hello');
 * if (result.isOk()) {
 *   console.log(result.value);
 * }
 * ```
 */
export function myFunction(param1: number, param2: string): Result<string, VescError> {
  // Implementation
}
```

### Error Handling

Use `neverthrow` for functional error handling:

```typescript
import { ok, err, Result } from 'neverthrow';

// Error types
export class VescError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'VescError';
  }
}

// Function returning Result
export async function connect(port: string): Promise<Result<SerialConnection, VescError>> {
  try {
    const connection = new SerialConnection(port);
    await connection.open();
    return ok(connection);
  } catch (error) {
    return err(new VescError('ConnectionFailed', `Failed to connect to ${port}`, error));
  }
}

// Using the Result
const result = await connect('/dev/ttyACM0');
if (result.isErr()) {
  console.error(`Error: ${result.error.message}`);
  process.exit(1);
}
const connection = result.value;
```

### Async Patterns

```typescript
// Prefer async/await over Promise chains
export async function sendCommand(connection: SerialConnection, cmd: Command): Promise<Result<Response, VescError>> {
  const packet = encodeCommand(cmd);
  
  const writeResult = await connection.write(packet);
  if (writeResult.isErr()) {
    return err(writeResult.error);
  }

  // Use timeout for operations that may hang
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new VescError('Timeout', 'Command timed out')), 5000);
  });

  try {
    const response = await Promise.race([
      connection.readResponse(),
      timeoutPromise
    ]);
    return ok(response);
  } catch (error) {
    return err(new VescError('Timeout', 'Command timed out', error));
  }
}

// Use EventEmitter or callbacks for streaming data
import { EventEmitter } from 'events';

export class TelemetryStream extends EventEmitter {
  private connection: SerialConnection;

  constructor(connection: SerialConnection) {
    super();
    this.connection = connection;
  }

  start(): void {
    this.connection.on('data', (data) => {
      const values = parseTelemetry(data);
      this.emit('values', values);
    });
  }

  stop(): void {
    this.connection.removeAllListeners('data');
  }
}
```

### Commander Argument Definitions

```typescript
import { Command } from 'commander';
import { z } from 'zod';

// Schema validation
const RpmArgsSchema = z.object({
  rpm: z.coerce.number().int(),
  duration: z.coerce.number().optional(),
  port: z.string().optional(),
});

export function createMotorCommand(): Command {
  const motor = new Command('motor')
    .description('Motor control commands');

  motor
    .command('set-rpm')
    .description('Set motor RPM')
    .argument('<rpm>', 'Target RPM', parseInt)
    .option('-d, --duration <seconds>', 'Duration in seconds', parseInt)
    .option('-p, --port <path>', 'Serial port path')
    .action(async (rpm, options) => {
      const args = RpmArgsSchema.parse({ rpm, ...options });
      
      const result = await setRpm(args.rpm, args.duration);
      
      if (result.isErr()) {
        console.error(`Error: ${result.error.message}`);
        process.exit(1);
      }

      console.log(JSON.stringify(result.value, null, 2));
    });

  return motor;
}

// In main CLI setup
import { program } from 'commander';

program
  .name('veac')
  .version('0.1.0')
  .description('VESC Motor Controller CLI');

program.addCommand(createMotorCommand());
program.addCommand(createDeviceCommand());

program.parse();
```

### Test Conventions

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { PacketEncoder } from './packet';

describe('PacketEncoder', () => {
  let encoder: PacketEncoder;

  beforeEach(() => {
    encoder = new PacketEncoder();
  });

  it('should encode a valid packet', () => {
    const payload = new Uint8Array([0x04]);
    const result = encoder.encode(payload);
    
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBeInstanceOf(Uint8Array);
  });

  it('should return error for oversized packet', () => {
    const payload = new Uint8Array(1024);
    const result = encoder.encode(payload);
    
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().code).toBe('PacketTooLarge');
  });
});

// Integration tests
import { describe, it, expect } from 'bun:test';
import { $ } from 'bun';

describe('CLI Integration', () => {
  it('should show help', async () => {
    const result = await $`./dist/veac --help`.text();
    expect(result).toContain('VESC');
  });
});
```

### Logging and Output

```typescript
// Use console for CLI output (stdout/stderr)
export function printJson<T>(data: T): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printError(err: VescError): void {
  console.error(`Error [${err.code}]: ${err.message}`);
}

// Use stderr for errors, stdout for results
export function formatOutput(data: unknown, format: 'json' | 'yaml' | 'table'): void {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;
    case 'yaml':
      console.log(toYaml(data));
      break;
    case 'table':
      console.log(toTable(data));
      break;
  }
}
```

### Import Ordering

```typescript
// 1. Standard library
import { EventEmitter } from 'events';
import { readFileSync } from 'fs';

// 2. External packages (alphabetical)
import chalk from 'chalk';
import { Command } from 'commander';
import { Result, ok, err } from 'neverthrow';
import { z } from 'zod';

// 3. Internal workspace packages (alphabetical)
import { McValues } from '@veac/vesc-types';
import { VescProtocol } from '@veac/vesc-protocol';

// 4. Local imports (alphabetical)
import { ConfigUtils } from './config-utils';
import { formatOutput } from './output';
```

### File Headers

All source files should include:
- SPDX license identifier
- Module documentation comment

```typescript
// SPDX-License-Identifier: GPL-3.0

/**
 * VESC Protocol Implementation
 * 
 * Implements packet framing and CRC for VESC communication.
 */

// ... imports and code
```

## Git Conventions

### Commit Messages

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes
- `build`: Build system changes

Examples:
```
feat(protocol): add support for long packets (>255 bytes)

fix(connection): handle serial port disconnect during read

docs(readme): update installation instructions

test(motor): add integration tests for set-rpm command

chore(deps): update bun to 1.0.20
```

## TypeScript Configuration

### tsconfig.json (Root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@veac/*": ["./packages/*/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../vesc-types" }
  ]
}
```
