type ListenersMap = Map<unknown, Set<(...args: unknown[]) => void>>;
export type InitializedLazilyContext<T extends object> = {
    listeners: ListenersMap;
    initialized: true;
    released: false;
    value: T;
};
export type UninitializedLazilyContext = {
    listeners: ListenersMap;
    initialized: false;
    released: false;
};
export type ReleasedLazilyContext = { released: true };
export type LazilyContext<T extends object> = UninitializedLazilyContext | InitializedLazilyContext<T> | ReleasedLazilyContext;
const contexts = new WeakMap<object, LazilyContext<object>>();
const proxyToTarget = new WeakMap<object, object>();

export function setProxyTarget(proxy: object, target: object) {
    proxyToTarget.set(proxy, target);
}

export function getProxyTarget(proxy: object): object | undefined {
    return proxyToTarget.get(proxy);
}

export function getContext<T extends object>(instance: object) {
    // If this is a proxy, get the context from the target
    const target = getProxyTarget(instance);
    const actualInstance = target ?? instance;
    return contexts.get(actualInstance) as undefined | LazilyContext<T>;
}
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

export function clearContext(instance: object) {
    contexts.delete(instance);
}

export function isInitializedContext<T extends object>(
    context: LazilyContext<T> | undefined
): context is InitializedLazilyContext<T> {
    if (!context) {
        return false;
    }
    if (context.released) {
        return false;
    }
    return 'initialized' in context && context.initialized === true;
}
export function isValidContext<T extends object>(context: LazilyContext<T>): context is UninitializedLazilyContext | InitializedLazilyContext<T> {
    if (!context) {
        return false;
    }
    return !context.released;
}

