import type { Lazily } from '../core/Lazily';
import { GET } from '../core/lazily-instance';
import { lazy } from './lazy';

/**
 * Creates a lazily-initialized value with an explicit `get()` method
 * Unlike {@link lazy} which returns a transparent proxy, this returns an object
 * with a `get()` method that must be called explicitly to access the value.
 *
 * This is useful when you want more explicit control over when initialization occurs,
 * or when working with primitive values or when the proxy behavior is not desired.
 *
 * @template T - The type of object to be lazily initialized
 * @param factory - Function that creates the object when first accessed
 * @returns An object with a `get()` method that returns the lazily-initialized value
 *
 * @example
 * ```ts
 * const lazyConfig = value(() => {
 *   console.log('Loading config...');
 *   return { apiUrl: 'https://api.example.com' };
 * });
 *
 * // Factory not called yet
 * console.log('Config created');
 *
 * // Explicitly call get() to initialize
 * const config = lazyConfig.get(); // Logs: "Loading config..."
 * console.log(config.apiUrl); // "https://api.example.com"
 *
 * // Subsequent calls return the cached value
 * const config2 = lazyConfig.get(); // No log, returns cached value
 * ```
 *
 * @example
 * ```ts
 * // Useful for dependency injection
 * class Service {
 *   private db = value(() => new Database());
 *
 *   query() {
 *     return this.db.get().query('SELECT * FROM users');
 *   }
 * }
 * ```
 *
 * @throws {LazilyFactoryError} If the factory function throws an error during initialization
 */
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
