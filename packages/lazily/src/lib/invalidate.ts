import { INVALIDATE, isLazilyInstance } from '../core/lazily-instance';

export function invalidate(instance: object) {
    if (!isLazilyInstance(instance)) {
        return;
    }
    instance[INVALIDATE]();
}
