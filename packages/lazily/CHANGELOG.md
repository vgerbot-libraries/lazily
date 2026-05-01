# @vgerbot/lazily

## 0.1.1

### Patch Changes

- 48680c5: Add conditional recreation support for lazily instances:

  - Add `recreateWhen(instance, when)` to recreate an instance before access when a predicate returns `true`.
  - Add `onChange(snapshot, isEqual?)` to build recreation predicates by comparing consecutive snapshots (defaults to `Object.is`).
  - Add `onRefChange(snapshot)` as a convenience helper using strict equality (`===`).
  - Include supporting typings and examples for auto-refreshing lazy instances when external state changes.

## 0.1.0

### Minor Changes

- 639fec7: Initial release of `@vgerbot/lazily`.

  This package provides a lightweight, type-safe utility for lazy initialization in TypeScript.
  It supports transparent proxy-based lazy objects and explicit lazy values, along with lifecycle helpers such as initialization/invalidation hooks and reset controls.

  Key capabilities include:

  - Lazy object/value creation on first access
  - Initialization and invalidation lifecycle hooks
  - Invalidate/reset flow for controlled re-creation
  - Strongly typed error classes and error codes
