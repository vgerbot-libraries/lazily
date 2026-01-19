export const IS_INITIALIZED = Symbol('isInitialized');
export const RELEASE = Symbol('release');
export const INITIALIZE = Symbol('initialize');

export interface LazilyInstance {
    [IS_INITIALIZED](): boolean;
    [RELEASE](): void;
    [INITIALIZE](): void;
}

export function isLazilyInstance(instance: unknown): instance is LazilyInstance {
    return instance !== null && typeof instance === 'object' && IS_INITIALIZED in instance && RELEASE in instance;
}