import { NotLazilyInstanceError } from '../core/errors';
import { ON_INVALIDATE, isLazilyInstance } from '../core/lazily-instance';

/**
 * Registers a callback to be invoked when a lazily instance is invalidated.
 * If the instance is already invalidated, returns a no-op unsubscribe function.
 *
 * @template T - The type of the lazily instance
 * @param instance - The lazily instance to observe
 * @param callback - Function to call with the invalidated instance
 * @returns A function to unregister the callback
 * @throws {NotLazilyInstanceError} If the provided instance is not a lazily instance
 *
 * @example
 * ```ts
 * const lazy = lazy(() => ({ value: 42 }));
 *
 * const unsubscribe = onInvalidate(lazy, (obj) => {
 *   console.log('Invalidated:', obj.value);
 * });
 *
 * invalidate(lazy); // Logs: "Invalidated: 42"
 *
 * // Stop listening for future invalidations
 * unsubscribe();
 * ```
 *
 * @example
 * ```ts
 * const lazy = lazy(() => ({ value: 42 }));
 * invalidate(lazy);
 *
 * // Already invalidated, so the callback will not be called
 * const unsubscribe = onInvalidate(lazy, () => {
 *   console.log('This will not run');
 * });
 *
 * unsubscribe(); // No-op
 * ```
 */
export function onInvalidate<T extends object>(instance: T, callback: (object: T) => void) {
    if (!isLazilyInstance<T>(instance)) {
        throw new NotLazilyInstanceError(instance, {
            functionName: 'onInvalidate',
        });
    }
    return instance[ON_INVALIDATE](callback);
}
