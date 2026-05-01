import { NotLazilyInstanceError } from './errors';

/**
 * Symbol used to check if an instance has been initialized
 * @internal
 */
export const IS_INITIALIZED = Symbol('is-initialized');

/**
 * Symbol used to invalidate a lazily instance
 * @internal
 */
export const INVALIDATE = Symbol('invalidate');

/**
 * Symbol used to get the underlying value from a lazily instance
 * @internal
 */
export const GET = Symbol('get');

/**
 * Symbol used to register initialization callbacks
 * @internal
 */
export const ON_INITIALIZE = Symbol('on-initialize');
/**
 * Symbol used to register invalidation callbacks
 * @internal
 */
export const ON_INVALIDATE = Symbol('on-invalidate');

/**
 * Symbol used to trigger initialization events
 * @internal
 */
export const TRIGGER_INITIALIZE_EVENT = Symbol('trigger-initialize-event');

/**
 * Symbol used to identify lazily instances
 * @internal
 */
export const IS_LAZILY = Symbol('isLazily');

/**
 * Symbol used to reset a lazily instance
 * @internal
 */
export const RESET = Symbol('reset');

/**
 * Symbol used to register cache-validity checkers
 * @internal
 */
export const REGISTER_RECREATE_CHECKER = Symbol('register-recreate-checker');

/**
 * Interface representing a lazily-initialized instance
 * @template T - The type of the underlying object
 */
export interface LazilyInstance<T extends object> {
    /** Marker property to identify lazily instances */
    [IS_LAZILY]: true;

    /**
     * Checks if the instance has been initialized
     * @returns True if initialized, false otherwise
     */
    [IS_INITIALIZED](): boolean;

    /**
     * Invalidates the instance, preventing further access until reset
     */
    [INVALIDATE](): void;

    /**
     * Gets the underlying value, initializing it if necessary
     * @returns The initialized value
     * @throws {InvalidatedLazilyError} If the instance has been invalidated
     * @throws {LazilyFactoryError} If the factory function throws an error
     */
    [GET](): T;

    /**
     * Registers a callback to be invoked when the instance is initialized
     * @param callback - Function to call with the initialized instance
     * @returns A function to unregister the callback
     */
    [ON_INITIALIZE](callback: (instance: T) => void): () => void;
    /**
     * Registers a callback to be invoked when the instance is invalidated after initialization.
     * @param callback - Function to call with the initialized instance
     * @returns A function to unregister the callback
     */
    [ON_INVALIDATE](callback: (instance: T) => void): () => void;

    /**
     * Resets the lazily instance to its uninitialized state
     */
    [RESET](): void;

    /**
     * Registers a checker for current cached value validity.
     * Returns an unsubscribe function that removes the checker.
     */
    [REGISTER_RECREATE_CHECKER](checker: () => boolean): () => void;
}

/**
 * Type guard to check if a value is a lazily instance
 * @template T - The expected type of the underlying object
 * @param instance - The value to check
 * @returns True if the value is a lazily instance, false otherwise
 * @example
 * ```ts
 * const lazy = lazy(() => ({ value: 42 }));
 * if (isLazilyInstance(lazy)) {
 *   // TypeScript knows lazy is a LazilyInstance
 * }
 * ```
 */
export function isLazilyInstance<T extends object>(
    instance: unknown
): instance is LazilyInstance<T> {
    return (
        instance !== null &&
        typeof instance === 'object' &&
        IS_LAZILY in instance &&
        !!instance[IS_LAZILY]
    );
}

/**
 * Asserts that a value is a lazily instance, throwing an error if it is not
 * @param instance - The value to check
 * @throws {NotLazilyInstanceError} If the value is not a lazily instance
 * @example
 * ```ts
 * function processLazy(obj: unknown) {
 *   assertIsLazilyInstance(obj);
 *   // TypeScript now knows obj is a LazilyInstance
 *   obj[GET]();
 * }
 * ```
 */
export function assertIsLazilyInstance(
    instance: unknown
): asserts instance is LazilyInstance<object> {
    if (!isLazilyInstance(instance)) {
        throw new NotLazilyInstanceError(instance, {
            functionName: 'assertIsLazilyInstance',
        });
    }
}
