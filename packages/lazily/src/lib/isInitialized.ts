import { getContext, isInitializedContext } from '../core/context';
import { isLazilyInstance } from '../core/lazily-instance';

export function isInitialized(instance: unknown) {
    if (!isLazilyInstance(instance)) {
        return true;
    }
    const context = getContext(instance);
    return isInitializedContext(context);
}
