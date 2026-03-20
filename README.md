# Lazily

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5277a66e4f2246db8b064102c88dbd4a)](https://app.codacy.com/gh/vgerbot-libraries/lazily?utm_source=github.com&utm_medium=referral&utm_content=vgerbot-libraries/lazily&utm_campaign=Badge_Grade)

A powerful TypeScript library for lazy initialization of objects. Lazily allows you to defer expensive object creation until the first access, improving performance and reducing memory usage.

## Features

- 🚀 **Lazy Initialization**: Create objects that are only instantiated when first accessed
- 🔄 **Automatic Caching**: Factory functions are called only once, subsequent accesses return the cached instance
- 🎯 **TypeScript Support**: Full type safety with TypeScript
- 🔌 **Wire Function**: Automatically replace lazy instances with real values when initialized
- 📡 **Event System**: Listen for initialization events with `onInitialized`
- 🛡️ **Error Handling**: Comprehensive error classes for programmatic error handling
- ♻️ **Lifecycle Management**: Invalidate and reset lazy instances as needed

## Installation

```bash
npm install @vgerbot/lazily
# or
pnpm add @vgerbot/lazily
# or
yarn add @vgerbot/lazily
```

## Quick Start

```typescript
import { lazy } from '@vgerbot/lazily';

// Create a lazy instance
const expensiveObject = lazy(() => {
    console.log('Creating expensive object...');
    return {
        data: 'some expensive computation',
        process() {
            return this.data.toUpperCase();
        }
    };
});

// Factory hasn't been called yet
console.log('Object created, but not initialized');

// First access triggers initialization
const result = expensiveObject.process(); // "Creating expensive object..." is logged
console.log(result); // "SOME EXPENSIVE COMPUTATION"

// Subsequent accesses use cached instance
expensiveObject.process(); // No log, uses cached instance
```

## API Reference

### `lazy<T>(factory: () => T): T`

Creates a lazy instance that will be initialized on first access.

**Parameters:**

- `factory`: A function that returns the object to be lazily initialized

**Returns:** A proxy object that behaves like the target object, but delays initialization until first access.

**Example:**

```typescript
import { lazy } from '@vgerbot/lazily';

class DatabaseConnection {
    connect() {
        return 'Connected to database';
    }
}

const db = lazy(() => {
    console.log('Establishing database connection...');
    return new DatabaseConnection();
});

// Connection not established yet
// ... later ...
db.connect(); // "Establishing database connection..." is logged
```

### `value<T>(factory: () => T): { get: () => T }`

Creates a lazy value with an explicit `get()` method for accessing the value.

**Parameters:**

- `factory`: A function that returns the value to be lazily initialized

**Returns:** An object with a `get()` method that returns the lazily initialized value.

**Example:**

```typescript
import { value } from '@vgerbot/lazily';

const config = value(() => {
    return JSON.parse(fs.readFileSync('config.json', 'utf-8'));
});

// Access via get() method
const configData = config.get();
```

### `isInitialized(instance: unknown): boolean`

Checks whether a lazy instance has been initialized.

**Parameters:**

- `instance`: The instance to check (can be any value)

**Returns:** `true` if the instance is initialized or not a lazy instance, `false` otherwise.

**Example:**

```typescript
import { lazy, isInitialized } from '@vgerbot/lazily';

const obj = lazy(() => ({ value: 42 }));

console.log(isInitialized(obj)); // false

const _ = obj.value;

console.log(isInitialized(obj)); // true
```

### `onInitialized<T>(instance: T, callback: (object: T) => void): () => void`

Registers a callback to be called when a lazy instance is initialized.

**Parameters:**

- `instance`: The lazy instance to watch
- `callback`: A function to call when the instance is initialized, receiving the initialized object

**Returns:** An unsubscribe function to remove the callback.

**Example:**

```typescript
import { lazy, onInitialized } from '@vgerbot/lazily';

const service = lazy(() => ({ name: 'MyService' }));

const unsubscribe = onInitialized(service, (initializedService) => {
    console.log(`Service ${initializedService.name} is ready!`);
});

// Later, when service is accessed
const _ = service.name; // "Service MyService is ready!" is logged

// Unsubscribe if needed
unsubscribe();
```

### `wire<T>(object: T, callback: (this: T) => void): void`

Wires lazy instances to an object, automatically replacing them with real values when initialized.

**Parameters:**

- `object`: The target object to wire lazy instances to
- `callback`: A function that sets lazy instances as properties on the object

**Example:**

```typescript
import { lazy, wire } from '@vgerbot/lazily';

class Application {
    declare database: DatabaseConnection;
    declare cache: CacheService;
    constructor() {
        wire(this, function() {
            this.database = lazy(() => new DatabaseConnection());
            this.cache = lazy(() => new CacheService());
        });
    }
}

const app = new Application();

// Initially, app.database is the lazy instance
// When accessed:
const _ = app.database.connect();

// app.database is now replaced with the real DatabaseConnection instance
```

### `invalidate(instance: object): void`

Invalidates a lazy instance, preventing further access until reset.

**Parameters:**

- `instance`: The lazy instance to invalidate

**Example:**

```typescript
import { lazy, invalidate } from '@vgerbot/lazily';

const obj = lazy(() => ({ value: 42 }));
const _ = obj.value; // Initialize

invalidate(obj);

try {
    const __ = obj.value; // Throws InvalidatedLazilyError
} catch (error) {
    console.error(error.message);
}
```

### `reset<T>(instance: T): void`

Resets a lazy instance to its uninitialized state, allowing it to be re-initialized.

**Parameters:**

- `instance`: The lazy instance to reset

**Example:**

```typescript
import { lazy, reset, invalidate } from '@vgerbot/lazily';

let callCount = 0;
const obj = lazy(() => {
    callCount++;
    return { value: callCount };
});

const value1 = obj.value; // callCount = 1
invalidate(obj);
reset(obj);

const value2 = obj.value; // callCount = 2
```

## Error Handling

The library provides several error classes for programmatic error handling:

### `InvalidatedLazilyError`

Thrown when attempting to access an invalidated lazy instance.

```typescript
import { lazy, invalidate, InvalidatedLazilyError } from '@vgerbot/lazily';

const obj = lazy(() => ({ value: 42 }));
invalidate(obj);

try {
    const _ = obj.value;
} catch (error) {
    if (error instanceof InvalidatedLazilyError) {
        console.error('Instance has been invalidated');
    }
}
```

### `NotLazilyInstanceError`

Thrown when a function expecting a lazy instance receives a non-lazy value.

```typescript
import { onInitialized, NotLazilyInstanceError } from '@vgerbot/lazily';

try {
    onInitialized({}, () => {});
} catch (error) {
    if (error instanceof NotLazilyInstanceError) {
        console.error('Expected a lazy instance');
    }
}
```

### `LazilyFactoryError`

Thrown when the factory function throws an error during initialization.

```typescript
import { lazy, LazilyFactoryError } from '@vgerbot/lazily';

const obj = lazy(() => {
    throw new Error('Factory failed');
});

try {
    const _ = obj.value;
} catch (error) {
    if (error instanceof LazilyFactoryError) {
        console.error('Factory error:', error.message);
        console.error('Original error:', error.context?.originalError);
    }
}
```

### Error Codes

All errors include a `code` property for programmatic handling:

```typescript
import { LazilyErrorCode } from '@vgerbot/lazily';

if (error.code === LazilyErrorCode.INVALIDATED_ACCESS) {
    // Handle invalidated access
} else if (error.code === LazilyErrorCode.NOT_LAZILY_INSTANCE) {
    // Handle non-lazy instance
} else if (error.code === LazilyErrorCode.FACTORY_ERROR) {
    // Handle factory error
}
```

## Usage Examples

### Class with Lazy Properties

```typescript
import { lazy } from '@vgerbot/lazily';

class Editor {
    public content = '';

    setContent(content: string) {
        this.content = content;
    }

    getContent() {
        return this.content;
    }
}

class Document {
    declare editor: Editor;

    constructor() {
        this.editor = lazy(() => new Editor());
    }
}

const doc = new Document();
// Editor not created yet

doc.editor.setContent('Hello World');
// Editor created on first access

console.log(doc.editor.getContent()); // "Hello World"
```

### Nested Lazy Initialization

```typescript
import { lazy, isInitialized } from '@vgerbot/lazily';

class Inner {
    public value = 1;
}

class Outer {
    declare inner: Inner;

    constructor() {
        this.inner = lazy(() => new Inner());
    }
}

const outer = lazy(() => new Outer());

console.log(isInitialized(outer)); // false
console.log(isInitialized(outer.inner)); // false

const value = outer.inner.value;

console.log(isInitialized(outer)); // true
console.log(isInitialized(outer.inner)); // true
console.log(value); // 1
```

### Lifecycle Management

```typescript
import { lazy, invalidate, reset, onInitialized } from '@vgerbot/lazily';

let callCount = 0;
const instance = lazy(() => {
    callCount++;
    return { value: callCount };
});

// Register callback before initialization
onInitialized(instance, (obj) => {
    console.log(`Instance initialized with value: ${obj.value}`);
});

const value1 = instance.value; // Logs: "Instance initialized with value: 1"
console.log(callCount); // 1

invalidate(instance);
reset(instance);

const value2 = instance.value; // Logs: "Instance initialized with value: 2"
console.log(callCount); // 2
```

### Wire Function for Dependency Injection

```typescript
import { lazy, wire } from '@vgerbot/lazily';

class DatabaseService {
    query(sql: string) {
        return `Executing: ${sql}`;
    }
}

class CacheService {
    get(key: string) {
        return `Cache: ${key}`;
    }
}

class Application {
    declare database: DatabaseService;
    declare cache: CacheService;
    constructor() {
        wire(app, function() {
            this.database = lazy(() => new DatabaseService());
            this.cache = lazy(() => new CacheService());
        });
    }
}

const app = new Application();

// Services are lazy instances
// When accessed, they're automatically replaced with real instances
const result = app.database.query('SELECT * FROM users');
// app.database is now the real DatabaseService instance
```

## Development

This project uses Nx, TypeScript, and modern tooling.

### Setup

```bash
pnpm install
```

### Development Commands

- `pnpm start` - Build and watch for changes
- `pnpm build` - Build the library
- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Lint code with Biome
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Biome

### Publishing

This project uses Changesets for version management and publishing.

- `pnpm changeset` - Create a changeset
- `pnpm version` - Version packages based on changesets
- `pnpm release` - Build and publish packages

## License

MIT
