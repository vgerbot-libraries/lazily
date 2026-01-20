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

export function getContext<T extends object>(instance: object) {
    return contexts.get(instance) as undefined | LazilyContext<T>;
}
export function defineContext(instance: object, context: LazilyContext<object>) {
    contexts.set(instance, context);
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
    return context.initialized;
}
export function isValidContext<T extends object>(context: LazilyContext<T>): context is UninitializedLazilyContext | InitializedLazilyContext<T> {
    if (!context) {
        return false;
    }
    return !context.released;
}

