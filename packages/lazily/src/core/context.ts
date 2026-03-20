/**
 * Map of event keys to their listener sets
 * @internal
 */
type ListenersMap = Map<unknown, Set<(...args: unknown[]) => void>>;

/**
 * Context for a lazily instance that has been initialized
 * @template T - The type of the initialized value
 */
export interface InitializedLazilyContext<T extends object>  {
    /** Map of event listeners */
    listeners: ListenersMap;
    /** Indicates the instance has been initialized */
    initialized: true;
    /** Indicates the instance has not been invalidated */
    invalidated: false;
    /** The initialized value */
    value: T;
}

/**
 * Context for a lazily instance that has not been initialized yet
 */
export interface UninitializedLazilyContext {
    /** Map of event listeners */
    listeners: ListenersMap;
    /** Indicates the instance has not been initialized */
    initialized: false;
    /** Indicates the instance has not been invalidated */
    invalidated: false;
}

/**
 * Context for a lazily instance that has been invalidated
 */
export type InvalidatedLazilyContext = {
    /** Indicates the instance has been invalidated */
    invalidated: true
};

/**
 * Union type representing all possible context states for a lazily instance
 * @template T - The type of the value when initialized
 */
export type LazilyContext<T extends object> =
    | UninitializedLazilyContext
    | InitializedLazilyContext<T>
    | InvalidatedLazilyContext;

/**
 * WeakMap storing contexts for lazily instances
 * @internal
 */
const contexts = new WeakMap<object, LazilyContext<object>>();

/**
 * WeakMap storing the relationship between proxies and their targets
 * @internal
 */
const proxyToTarget = new WeakMap<object, object>();

/**
 * Associates a proxy with its target object
 * @param proxy - The proxy object
 * @param target - The target object that the proxy wraps
 * @internal
 */
export function setProxyTarget(proxy: object, target: object) {
    proxyToTarget.set(proxy, target);
}

/**
 * Retrieves the target object for a given proxy
 * @param proxy - The proxy object
 * @returns The target object, or undefined if not found
 * @internal
 */
export function getProxyTarget(proxy: object): object | undefined {
    return proxyToTarget.get(proxy);
}

/**
 * Retrieves the context for a lazily instance
 * If the instance is a proxy, retrieves the context from the underlying target
 * @template T - The type of the value when initialized
 * @param instance - The lazily instance (may be a proxy)
 * @returns The context, or undefined if not found
 */
export function getContext<T extends object>(instance: object) {
    // If this is a proxy, get the context from the target
    const target = getProxyTarget(instance);
    const actualInstance = target ?? instance;
    return contexts.get(actualInstance) as undefined | LazilyContext<T>;
}

/**
 * Defines or updates the context for a lazily instance
 * If the instance is a proxy, stores the context on both the proxy and target
 * @param instance - The lazily instance (may be a proxy)
 * @param context - The context to store
 */
export function defineContext(instance: object, context: LazilyContext<object>) {
    // If this is a proxy, also store context on the target
    const target = getProxyTarget(instance);
    if (target) {
        contexts.set(target, context);
        // Also store on proxy for direct access
        contexts.set(instance, context);
    } else {
        contexts.set(instance, context);
    }
}

/**
 * Removes the context for a lazily instance
 * @param instance - The lazily instance
 */
export function clearContext(instance: object) {
    contexts.delete(instance);
}

/**
 * Type guard to check if a context represents an initialized state
 * @template T - The type of the value when initialized
 * @param context - The context to check
 * @returns True if the context is initialized, false otherwise
 */
export function isInitializedContext<T extends object>(
    context: LazilyContext<T> | undefined
): context is InitializedLazilyContext<T> {
    if (!context) {
        return false;
    }
    if (context.invalidated) {
        return false;
    }
    return 'initialized' in context && context.initialized;
}

/**
 * Type guard to check if a context is valid (not invalidated)
 * @template T - The type of the value when initialized
 * @param context - The context to check
 * @returns True if the context is valid (uninitialized or initialized), false if invalidated
 */
export function isValidContext<T extends object>(
    context: LazilyContext<T>
): context is UninitializedLazilyContext | InitializedLazilyContext<T> {
    if (!context) {
        return false;
    }
    return !context.invalidated;
}
