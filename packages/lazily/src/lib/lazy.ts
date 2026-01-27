import { Lazily } from '../core/Lazily';
import { setProxyTarget } from '../core/context';
import { LazilyProxyHandler } from '../core/proxy-handler';

/**
 * Creates a lazily-initialized proxy object
 * The factory function is not called until a property on the returned object is accessed.
 * Once initialized, the same instance is returned for all subsequent accesses.
 *
 * @template T - The type of object to be lazily initialized
 * @param factory - Function that creates the object when first accessed
 * @returns A proxy that behaves like the object but defers initialization
 *
 * @example
 * ```ts
 * // Create a lazy instance
 * const lazyConfig = lazy(() => {
 *   console.log('Loading config...');
 *   return { apiUrl: 'https://api.example.com' };
 * });
 *
 * // Factory not called yet
 * console.log('Config created');
 *
 * // Factory called on first access
 * console.log(lazyConfig.apiUrl); // Logs: "Loading config..." then "https://api.example.com"
 *
 * // Factory not called again
 * console.log(lazyConfig.apiUrl); // Logs: "https://api.example.com"
 * ```
 *
 * @throws {LazilyFactoryError} If the factory function throws an error during initialization
 */
export function lazy<T extends object>(factory: () => T): T {
    const lazily = new Lazily<T>(factory);
    const proxy = new Proxy(lazily as T, new LazilyProxyHandler<T>());
    setProxyTarget(proxy, lazily);
    return proxy;
}
