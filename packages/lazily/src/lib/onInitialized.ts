import { isLazilyInstance, ON_INITIALIZE } from '../core/lazily-instance';

export function onInitialized<T extends object>(instance: T, callback: (object: T) => void) {
    if (!isLazilyInstance(instance)) {
        throw new TypeError('The specified instance of not lazily');
    }
    return instance[ON_INITIALIZE]((instance) => {
        callback(instance as T);
    });
}
