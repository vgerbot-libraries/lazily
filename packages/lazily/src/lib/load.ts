import { GET, isLazilyInstance } from "../core/lazily-instance";

export function load<T extends object>(instance: T, until: Promise<unknown>): Promise<T> {
    if(!isLazilyInstance<T>(instance)) {
        return until.then(() => instance);
    }
    return until.then(() => instance[GET]());
}

export function loadSync<T extends object>(instance: T): T {
    if(!isLazilyInstance<T>(instance)) {
        return instance;
    }
    return instance[GET]();
}
