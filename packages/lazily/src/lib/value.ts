import type { Lazily } from '../core/Lazily';
import { GET } from '../core/lazily-instance';
import { lazy } from './lazy';

export function value<T extends object>(factory: () => T) {
    const lazily = lazy(factory) as Lazily<T>;
    Object.defineProperty(lazily, 'get', {
        value: () => lazily[GET](),
        writable: false,
    });
    return lazily as unknown as {
        get: () => T;
    };
}
