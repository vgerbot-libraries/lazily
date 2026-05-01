import { defineContext, getContext } from '../core/context';
import { RESET, assertIsLazilyInstance } from '../core/lazily-instance';

/**
 * Resets a lazily instance to its uninitialized state
 *
 * - If the instance is invalidated, resets it to uninitialized with empty listeners
 * - If the instance is initialized, resets it to uninitialized while preserving listeners
 * - If the instance is already uninitialized, this is a no-op
 *
 * After reset, the next access will trigger re-initialization by calling the factory again.
 *
 * @template T - The type of the lazily instance
 * @param instance - The lazily instance to reset
 * @throws {NotLazilyInstanceError} If the provided instance is not a lazily instance
 *
 * @example
 * ```ts
 * let callCount = 0;
 * const lazy = lazy(() => {
 *   callCount++;
 *   return { value: callCount };
 * });
 *
 * console.log(lazy.value); // 1
 * console.log(lazy.value); // 1 (cached)
 *
 * // Reset the instance
 * reset(lazy);
 *
 * console.log(lazy.value); // 2 (factory called again)
 * console.log(lazy.value); // 2 (cached)
 * ```
 *
 * @example
 * ```ts
 * // Reset after invalidation
 * const lazy = lazy(() => ({ value: 42 }));
 * invalidate(lazy);
 *
 * // This would throw without reset
 * reset(lazy);
 * console.log(lazy.value); // 42 (re-initialized)
 * ```
 *
 * @see {@link invalidate} to prevent access to an instance
 */
export function reset<T>(instance: T) {
    assertIsLazilyInstance(instance);

    instance[RESET]();
}
