import {
    type UninitializedLazilyContext,
    defineContext,
    getContext,
    isInitializedContext,
    isValidContext,
} from './context';
import {
    GET,
    IS_INITIALIZED,
    IS_LAZILY,
    type LazilyInstance,
    ON_INITIALIZE,
    RELEASE,
} from './lazily-instance';
const INITIALIZE_EVENT_KEY = Symbol('initialize-event');

export class Lazily<T extends object> implements LazilyInstance<T> {
    constructor(private readonly factory: () => T) {}
    [IS_LAZILY]: true = true;
    [IS_INITIALIZED](): boolean {
        return isInitializedContext(getContext(this));
    }
    [RELEASE](): void {
        defineContext(this, {
            released: true,
        });
    }
    [GET](): T {
        const context = getContext<T>(this);
        if (isInitializedContext(context)) {
            return context.value;
        }
        if (context?.released) {
            throw new ReferenceError('Accessing released lazily variables');
        }
        const realInstance = this.factory.call(null);
        const existingListeners = isValidContext(context) ? context.listeners : new Map();
        defineContext(this, {
            listeners: existingListeners,
            value: realInstance,
            released: false,
            initialized: true,
        });

        // Trigger initialization callbacks
        const listeners = existingListeners.get(INITIALIZE_EVENT_KEY);
        if (listeners) {
            for (const callback of listeners) {
                callback(realInstance);
            }
        }

        return realInstance;
    }
    [ON_INITIALIZE](callback: (instance: unknown) => void): () => void {
        const context =
            getContext<T>(this) ??
            (() => {
                const ctx = {
                    listeners: new Map(),
                    released: false,
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

        const listener = callback.bind(null);
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
}
