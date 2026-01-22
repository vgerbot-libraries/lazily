import { ON_INITIALIZE, isLazilyInstance } from '../core/lazily-instance';

export function onInitialized<T extends object>(instance: T, callback: (object: T) => void) {
    if (!isLazilyInstance<T>(instance)) {
        throw new TypeError('The specified instance of not lazily');
    }
    return instance[ON_INITIALIZE](callback);
}
