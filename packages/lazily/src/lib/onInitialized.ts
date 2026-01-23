import { ON_INITIALIZE, isLazilyInstance } from '../core/lazily-instance';
import { NotLazilyInstanceError } from '../core/errors';

export function onInitialized<T extends object>(instance: T, callback: (object: T) => void) {
    if (!isLazilyInstance<T>(instance)) {
        throw new NotLazilyInstanceError(instance, {
            functionName: 'onInitialized',
        });
    }
    return instance[ON_INITIALIZE](callback);
}
