import { Lazily } from "../core/Lazily";
import { GET } from "../core/lazily-instance";
import { create } from "./create"

export function value<T extends object>(factory: () => T) {
    const lazily = create(factory) as Lazily<T>;
    Object.defineProperty(lazily, 'get', {
        value: () => lazily[GET](),
        writable: false
    });
    return lazily as unknown as {
        get: () => T
    };
}
