export const IS_INITIALIZED = Symbol('is-initialized');
export const RELEASE = Symbol('release');
export const GET = Symbol('get');
export const ON_INITIALIZE = Symbol('on-initialize');
export const TRIGGER_INITIALIZE_EVENT = Symbol('trigger-initialize-event');
export const IS_LAZILY = Symbol('isLazily');

export interface LazilyInstance<T extends object> {
    [IS_LAZILY]: true;
    [IS_INITIALIZED](): boolean;
    [RELEASE](): void;
    [GET](): T;
    [ON_INITIALIZE](callback: (instance: unknown) => void): () => void;
}

export function isLazilyInstance(instance: unknown): instance is LazilyInstance<object> {
    return (
        instance !== null &&
        typeof instance === 'object' &&
        IS_LAZILY in instance &&
        !!instance[IS_LAZILY]
    );
}

export function assertIsLazilyInstance(
    instance: unknown
): asserts instance is LazilyInstance<object> {
    if (!isLazilyInstance(instance)) {
        throw new TypeError('The specified instance is not lazily!');
    }
}
