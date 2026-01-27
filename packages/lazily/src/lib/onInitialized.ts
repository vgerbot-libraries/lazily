import { ON_INITIALIZE, isLazilyInstance } from '../core/lazily-instance';
import { NotLazilyInstanceError } from '../core/errors';

/**
 * Registers a callback to be invoked when a lazily instance is initialized
 * If the instance is already initialized, the callback is invoked immediately.
 *
 * @template T - The type of the lazily instance
 * @param instance - The lazily instance to observe
 * @param callback - Function to call with the initialized value
 * @returns A function to unregister the callback
 * @throws {NotLazilyInstanceError} If the provided instance is not a lazily instance
 *
 * @example
 * ```ts
 * const lazy = lazy(() => {
 *   console.log('Initializing...');
 *   return { value: 42 };
 * });
 *
 * // Register a callback before initialization
 * const unsubscribe = onInitialized(lazy, (obj) => {
 *   console.log('Initialized with value:', obj.value);
 * });
 *
 * // Trigger initialization
 * console.log(lazy.value); // Logs: "Initializing..." then "Initialized with value: 42" then "42"
 *
 * // Unregister the callback
 * unsubscribe();
 * ```
 *
 * @example
 * ```ts
 * // If already initialized, callback is invoked immediately
 * const lazy = lazy(() => ({ value: 42 }));
 * lazy.value; // Initialize
 *
 * onInitialized(lazy, (obj) => {
 *   console.log('Already initialized:', obj.value); // Logs immediately
 * });
 * ```
 */
export function onInitialized<T extends object>(instance: T, callback: (object: T) => void) {
    if (!isLazilyInstance<T>(instance)) {
        throw new NotLazilyInstanceError(instance, {
            functionName: 'onInitialized',
        });
    }
    return instance[ON_INITIALIZE](callback);
}
