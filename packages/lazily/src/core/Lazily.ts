import {
    type UninitializedLazilyContext,
    defineContext,
    getContext,
    isInitializedContext,
    isValidContext,
} from './context';
import {
    InvalidatedLazilyError,
    LazilyFactoryError,
} from './errors';
import {
    GET,
    IS_INITIALIZED,
    IS_LAZILY,
    type LazilyInstance,
    ON_INITIALIZE,
    INVALIDATE,
} from './lazily-instance';
const INITIALIZE_EVENT_KEY = Symbol('initialize-event');

export class Lazily<T extends object> implements LazilyInstance<T> {
    constructor(private readonly factory: () => T) {}
    [IS_LAZILY]: true = true;
    [IS_INITIALIZED](): boolean {
        return isInitializedContext(getContext(this));
    }
    [INVALIDATE](): void {
        defineContext(this, {
            invalidated: true,
        });
    }
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
    [ON_INITIALIZE](callback: (instance: T) => void): () => void {
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
        if (isInitializedContext(context)) {
            callback(context.value);
            return () => {};
        }

        const listeners =
            context.listeners.get(INITIALIZE_EVENT_KEY) ??
            (() => {
                const set = new Set<(...args: unknown[]) => void>();
                context.listeners.set(INITIALIZE_EVENT_KEY, set);
                return set;
            })();

        const listener = callback.bind(null) as (...args: unknown[]) => void;
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
}
