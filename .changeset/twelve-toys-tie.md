---
"@vgerbot/lazily": patch
---

Add conditional recreation support for lazily instances:

- Add `recreateWhen(instance, when)` to recreate an instance before access when a predicate returns `true`.
- Add `onChange(snapshot, isEqual?)` to build recreation predicates by comparing consecutive snapshots (defaults to `Object.is`).
- Add `onRefChange(snapshot)` as a convenience helper using strict equality (`===`).
- Include supporting typings and examples for auto-refreshing lazy instances when external state changes.
