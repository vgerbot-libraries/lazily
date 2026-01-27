import { INVALIDATE, isLazilyInstance } from '../core/lazily-instance';

/**
 * Invalidates a lazily instance, preventing further access to its value
 * After invalidation, any attempt to access the instance will throw an {@link InvalidatedLazilyError}
 * until the instance is reset using {@link reset}.
 *
 * If the provided instance is not a lazily instance, this function does nothing.
 *
 * @param instance - The lazily instance to invalidate
 *
 * @example
 * ```ts
 * const lazy = lazy(() => ({ value: 42 }));
 *
 * console.log(lazy.value); // 42
 *
 * // Invalidate the instance
 * invalidate(lazy);
 *
 * // This will throw an InvalidatedLazilyError
 * try {
 *   console.log(lazy.value);
 * } catch (error) {
 *   console.error(error.message); // "Cannot access an invalidated lazily instance..."
 * }
 *
 * // Reset to re-enable access
 * reset(lazy);
 * console.log(lazy.value); // 42 (re-initialized)
 * ```
 *
 * @see {@link reset} to re-enable access after invalidation
 */
export function invalidate(instance: object) {
    if (!isLazilyInstance(instance)) {
        return;
    }
    instance[INVALIDATE]();
}
