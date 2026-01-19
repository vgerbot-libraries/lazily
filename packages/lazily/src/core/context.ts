export interface LazilyContext {
    initialized: boolean;
    value: object;
}
const contexts = new WeakMap<object, LazilyContext>();

export function getContext(instance: object) {
    return contexts.get(instance);
}
export function defineContext(instance: object, context: LazilyContext) {
    contexts.set(instance, context);
}

export function clearContext(instance: object) {
    contexts.delete(instance);
}