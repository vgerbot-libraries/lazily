---
"@vgerbot/lazily": patch
---

Add composable `when(callback)` API for building recreation conditions with a condition token:

- `when(token => ...)` builds a reusable condition graph from a callback that receives a `ConditionToken`.
- Token methods: `refChange`, `changed`, `and`, `or`, `not`, `any`, `all`, `iff`, `once`.
- `any`/`all` are aliases for `or`/`and` with clearer semantics for multiple conditions.
- `iff(condition, then, else?)` branches between two conditions based on a guard; defaults to `false` when `else` is omitted.
- `once(condition)` fires at most once, then always returns `false`.
- Export `when`, `ConditionToken`, `ConditionNode`, `ConditionLike` from the package entry point.
