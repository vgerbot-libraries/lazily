import { GET, isLazilyInstance } from "../core/lazily-instance";

export function load<T extends object>(instance: T, until: Promise<unknown>): Promise<T> {
    return until.then(() => loadSync(instance));
}

export function loadSync<T extends object>(instance: T): T {
    if(!isLazilyInstance<T>(instance)) {
        return instance;
    }
    return instance[GET]();
}
