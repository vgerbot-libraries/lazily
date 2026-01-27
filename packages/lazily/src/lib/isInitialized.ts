import { getContext, isInitializedContext } from '../core/context';
import { isLazilyInstance } from '../core/lazily-instance';

/**
 * Checks if a lazily instance has been initialized
 * For non-lazily instances, always returns true (they are considered "already initialized").
 *
 * @param instance - The instance to check
 * @returns True if the instance is initialized or not a lazily instance, false otherwise
 *
 * @example
 * ```ts
 * const lazy = lazy(() => ({ value: 42 }));
 *
 * console.log(isInitialized(lazy)); // false
 *
 * // Access a property to trigger initialization
 * console.log(lazy.value); // 42
 *
 * console.log(isInitialized(lazy)); // true
 *
 * // Non-lazily instances are always considered initialized
 * console.log(isInitialized({ value: 42 })); // true
 * ```
 */
export function isInitialized(instance: unknown) {
    if (!isLazilyInstance(instance)) {
        return true;
    }
    const context = getContext(instance);
    return isInitializedContext(context);
}
