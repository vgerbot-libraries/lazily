import { RELEASE, isLazilyInstance } from '../core/lazily-instance';

export function release(instance: object) {
    if (!isLazilyInstance(instance)) {
        return;
    }
    instance[RELEASE]();
}
