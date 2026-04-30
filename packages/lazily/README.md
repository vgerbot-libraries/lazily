# Lazily

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/4bed1ef6f12748afa9058a6c2f4add76)](https://app.codacy.com/gh/vgerbot-libraries/lazily/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade) [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/4bed1ef6f12748afa9058a6c2f4add76)](https://app.codacy.com/gh/vgerbot-libraries/lazily/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

`@vgerbot/lazily` is a tiny TypeScript utility for lazy initialization.

It lets you defer object creation until first use, then cache the result. You also get lifecycle helpers (`onInitialized`, `invalidate`, `reset`, etc.) for advanced control.

## Features

- Lazy object initialization through transparent proxy access
- Explicit `get()` style lazy value access via `value()`
- Initialization and invalidation lifecycle hooks
- Invalidate/reset cycle support for controlled re-creation
- Type-safe API designed for TypeScript

## Installation

```bash
pnpm add @vgerbot/lazily
```

You can also use `npm` or `yarn`:

```bash
npm i @vgerbot/lazily
# or
yarn add @vgerbot/lazily
```

## Quick Start

```ts
import { lazy, isInitialized } from '@vgerbot/lazily';

const config = lazy(() => {
  console.log('creating config...');
  return {
    apiBaseUrl: 'https://api.example.com',
    timeout: 5000,
  };
});

console.log(isInitialized(config)); // false

// First property access initializes the object
console.log(config.apiBaseUrl); // logs "creating config..." then value

console.log(isInitialized(config)); // true
```

## API

### `lazy(factory)`

Creates a lazily-initialized proxy object.

- `factory` runs on first access only
- The returned object is cached and reused
- `factory` must return a non-null object

```ts
import { lazy } from '@vgerbot/lazily';

const db = lazy(() => ({
  connectedAt: Date.now(),
}));

// factory is called here
console.log(db.connectedAt);
```

### `value(factory)`

Creates a lazily-initialized value with explicit `get()` access.

```ts
import { value } from '@vgerbot/lazily';

const settings = value(() => ({ debug: true }));

const s = settings.get();
console.log(s.debug);
```

### `isInitialized(instance)`

Checks initialization state of a lazily instance.

```ts
import { lazy, isInitialized } from '@vgerbot/lazily';

const obj = lazy(() => ({ value: 1 }));
console.log(isInitialized(obj)); // false
console.log(obj.value); // initializes
console.log(isInitialized(obj)); // true
```

### `onInitialized(instance, callback)`

Subscribes to initialization.

- If already initialized, callback runs immediately
- Returns `unsubscribe()`

```ts
import { lazy, onInitialized } from '@vgerbot/lazily';

const service = lazy(() => ({ ready: true }));

const unsubscribe = onInitialized(service, (real) => {
  console.log('initialized:', real.ready);
});

service.ready; // triggers callback
unsubscribe();
```

### `onInvalidate(instance, callback)`

Subscribes to invalidation events.

```ts
import { lazy, onInvalidate, invalidate } from '@vgerbot/lazily';

const obj = lazy(() => ({ value: 42 }));

onInvalidate(obj, (real) => {
  console.log('invalidated value:', real.value);
});

obj.value; // initialize first
invalidate(obj); // callback runs
```

### `invalidate(instance)`

Invalidates a lazily instance.

- After invalidation, access throws until `reset()` is called
- No-op for non-lazily objects

```ts
import { lazy, invalidate } from '@vgerbot/lazily';

const obj = lazy(() => ({ value: 1 }));
obj.value;

invalidate(obj);
// obj.value now throws InvalidatedLazilyError
```

### `reset(instance)`

Resets a lazily instance to uninitialized state so it can be initialized again.

```ts
import { lazy, invalidate, reset } from '@vgerbot/lazily';

let count = 0;
const obj = lazy(() => ({ value: ++count }));

console.log(obj.value); // 1
invalidate(obj);
reset(obj);
console.log(obj.value); // 2
```

### `wire(object, callback)`

Wires assignments so lazy fields are automatically replaced with real initialized values.

Useful for DI-like object assembly.

```ts
import { lazy, wire } from '@vgerbot/lazily';

const target: { service?: { value: number } } = {};
const service = lazy(() => ({ value: 100 }));

wire(target, function () {
  this.service = service;
});

service.value; // initialize
// target.service is now the real initialized object
```

## Errors

`@vgerbot/lazily` exports strongly-typed error classes and codes:

- `LazilyError`
- `InvalidatedLazilyError`
- `NotLazilyInstanceError`
- `LazilyFactoryError`
- `InvalidFactoryReturnError`
- `LazilyErrorCode`

Example:

```ts
import { LazilyError, LazilyErrorCode } from '@vgerbot/lazily';

try {
  // your lazy logic
} catch (error) {
  if (error instanceof LazilyError) {
    if (error.code === LazilyErrorCode.INVALIDATED_ACCESS) {
      // handle invalidated access
    }
  }
}
```

## Notes

- `lazy()` and `value()` are object-oriented APIs; factories should return objects.
- `onInitialized()` and `onInvalidate()` throw if given a non-lazily instance.
- `invalidate()` is intentionally tolerant and does nothing for non-lazily values.

## Development

From repository root:

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typedoc
```

## License

MIT
