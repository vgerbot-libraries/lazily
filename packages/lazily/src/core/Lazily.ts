import {
    type UninitializedLazilyContext,
    defineContext,
    getContext,
    isInitializedContext,
    isValidContext,
} from './context';
import {
    InvalidatedLazilyError,
    InvalidFactoryReturnError,
    LazilyFactoryError,
} from './errors';
import {
    GET,
    IS_INITIALIZED,
    IS_LAZILY,
    type LazilyInstance,
    ON_INITIALIZE,
    INVALIDATE,
    ON_INVALIDATE,
} from './lazily-instance';

/**
 * Symbol key for storing initialization event listeners
 * @internal
 */
const INITIALIZE_EVENT_KEY = Symbol('initialize-event');

/**
 * Symbol key for storing invalidation event listeners
 * @internal
 */
const INVALIDATE_EVENT_KEY = Symbol('invalidate-event');

/**
 * Core class implementing lazy initialization behavior
 * This class wraps a factory function and defers its execution until the value is first accessed.
 * It manages the lifecycle of the lazy instance including initialization, invalidation, and callbacks.
 *
 * @template T - The type of the object to be lazily initialized
 * @internal
 */
export class Lazily<T extends object> implements LazilyInstance<T> {
    /**
     * Creates a new Lazily instance
     * @param factory - Function that creates the underlying value when first accessed
     */
    constructor(private readonly factory: () => T) {}

    /** @internal */
    [IS_LAZILY] = true as const;

    /**
     * Checks if the instance has been initialized
     * @returns True if the factory has been called and the value is available
     * @internal
     */
    [IS_INITIALIZED](): boolean {
        return isInitializedContext(getContext(this));
    }

    /**
     * Invalidates the instance, preventing further access
     * After invalidation, any attempt to access the value will throw an error
     * until the instance is reset.
     * @internal
     */
    [INVALIDATE](): void {
        const context = getContext<T>(this);
        if (isInitializedContext(context)) {
            const instance = context.value;
            const listeners = context.listeners.get(INVALIDATE_EVENT_KEY);
            if (listeners) {
                for (const listener of listeners) {
                    listener(instance);
                }
            }
        }
        defineContext(this, {
            invalidated: true,
        });
    }

    /**
     * Gets the underlying value, initializing it if necessary
     * On first access, calls the factory function and caches the result.
     * Subsequent calls return the cached value.
     *
     * @returns The initialized value
     * @throws {InvalidatedLazilyError} If the instance has been invalidated
     * @throws {LazilyFactoryError} If the factory function throws an error
     * @internal
     */
    [GET](): T {
        const context = getContext<T>(this);
        if (isInitializedContext(context)) {
            return context.value;
        }
        if (context?.invalidated) {
            throw new InvalidatedLazilyError({
                instanceType: this.constructor.name,
            });
        }

        let realInstance: T;
        try {
            realInstance = this.factory.call(null);
        } catch (error) {
            throw new LazilyFactoryError(error, {
                instanceType: this.constructor.name,
            });
        }

        // Validate factory return value
        if (realInstance === null || realInstance === undefined) {
            throw new InvalidFactoryReturnError(realInstance, {
                instanceType: this.constructor.name,
            });
        }

        // Check if return value is an object (not primitive types like number, string, boolean)
        if (typeof realInstance !== 'object') {
            throw new InvalidFactoryReturnError(realInstance, {
                instanceType: this.constructor.name,
            });
        }

        const existingListeners = context && isValidContext(context) ? context.listeners : new Map();
        defineContext(this, {
            listeners: existingListeners,
            value: realInstance,
            invalidated: false,
            initialized: true,
        });

        // Trigger initialization callbacks
        const listeners = existingListeners.get(INITIALIZE_EVENT_KEY);
        if (listeners) {
            for (const callback of listeners) {
                try {
                    callback(realInstance);
                } catch (error) {
                    // Log callback errors but don't fail initialization
                    // This allows other callbacks to still execute
                    console.error(
                        '[Lazily] Error in initialization callback:',
                        error instanceof Error ? error.message : String(error)
                    );
                }
            }
        }

        return realInstance;
    }
    /**
     * Registers an event listener for a specific event type
     * @param eventKey - The symbol key identifying the event type
     * @param callback - Function to call when the event occurs
     * @param invokeImmediately - Whether to invoke callback immediately if condition is met
     * @returns A function to unregister the callback
     * @internal
     */
    private registerEventListener(
        eventKey: symbol,
        callback: (instance: T) => void,
        invokeImmediately = false
    ): () => void {
        const context =
            getContext<T>(this) ??
            (() => {
                const ctx = {
                    listeners: new Map(),
                    invalidated: false,
                    initialized: false,
                } satisfies UninitializedLazilyContext;
                defineContext(this, ctx);
                return ctx;
            })();

        if (!isValidContext(context)) {
            return () => {};
        }

        // If already initialized, call callback immediately
        if (invokeImmediately && isInitializedContext(context)) {
            try {
                callback(context.value);
            } catch (error) {
                console.error(
                    '[Lazily] Error in initialization callback:',
                    error instanceof Error ? error.message : String(error)
                );
            }
            return () => {};
        }

        const listeners =
            context.listeners.get(eventKey) ??
            (() => {
                const set = new Set<(...args: unknown[]) => void>();
                context.listeners.set(eventKey, set);
                return set;
            })();

        const listener = callback.bind(null) as (...args: unknown[]) => void;
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }

    /**
     * Registers a callback to be invoked when the instance is initialized
     * If the instance is already initialized, the callback is invoked immediately.
     * If the instance is invalidated, returns a no-op unsubscribe function.
     *
     * @param callback - Function to call with the initialized instance
     * @returns A function to unregister the callback
     * @example
     * ```ts
     * const unsubscribe = instance[ON_INITIALIZE]((value) => {
     *   console.log('Initialized:', value);
     * });
     * // Later, to stop listening:
     * unsubscribe();
     * ```
     * @internal
     */
    [ON_INITIALIZE](callback: (instance: T) => void): () => void {
        return this.registerEventListener(INITIALIZE_EVENT_KEY, callback, true);
    }

    /**
     * Registers a callback to be invoked when the instance is invalidated
     * If the instance is invalidated, returns a no-op unsubscribe function.
     *
     * @param callback - Function to call with the instance when invalidated
     * @returns A function to unregister the callback
     * @example
     * ```ts
     * const unsubscribe = instance[ON_INVALIDATE]((value) => {
     *   console.log('Invalidated:', value);
     * });
     * // Later, to stop listening:
     * unsubscribe();
     * ```
     * @internal
     */
    [ON_INVALIDATE](callback: (instance: T) => void): () => void {
        return this.registerEventListener(INVALIDATE_EVENT_KEY, callback, false);
    }
}
