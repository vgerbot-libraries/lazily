# @vgerbot/lazily

## 0.1.3

### Patch Changes

- 1681c4c: Add composable `when(callback)` API for building recreation conditions with a condition token:

  - `when(token => ...)` builds a reusable condition graph from a callback that receives a `ConditionToken`.
  - Token methods: `refChange`, `changed`, `and`, `or`, `not`, `any`, `all`, `iff`, `once`.
  - `any`/`all` are aliases for `or`/`and` with clearer semantics for multiple conditions.
  - `iff(condition, then, else?)` branches between two conditions based on a guard; defaults to `false` when `else` is omitted.
  - `once(condition)` fires at most once, then always returns `false`.
  - Export `when`, `ConditionToken`, `ConditionNode`, `ConditionLike` from the package entry point.

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
