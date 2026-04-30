import { isLazilyInstance } from '../core/lazily-instance';
import { onInitialized } from './onInitialized';

/**
 * Wires up an object to automatically replace lazily instances with their initialized values
 *
 * This function creates a proxy around an object that intercepts property assignments.
 * When a lazily instance is assigned to a property, it automatically registers a callback
 * to replace that property with the actual initialized value once initialization occurs.
 *
 * This is useful for dependency injection scenarios where you want to assign lazy dependencies
 * but have them automatically resolve to their actual values when initialized.
 *
 * @template T - The type of the object to wire
 * @param object - The object to wire up
 * @param callback - Function called with the proxied object to perform assignments
 *
 * @example
 * ```ts
 * class Service {
 *   database: any;
 *   cache: any;
 * }
 *
 * const service = new Service();
 * const lazyDb = lazy(() => new Database());
 * const lazyCache = lazy(() => new Cache());
 *
 * wire(service, function() {
 *   this.database = lazyDb;  // Assigned as lazy
 *   this.cache = lazyCache;   // Assigned as lazy
 * });
 *
 * // Later, when lazyDb initializes, service.database is automatically updated
 * lazyDb.connect(); // Triggers initialization
 * // service.database is now the actual Database instance, not the proxy
 * ```
 *
 * @example
 * ```ts
 * // Useful for configuration objects
 * const config = {};
 *
 * wire(config, function() {
 *   this.api = lazy(() => loadApiConfig());
 *   this.db = lazy(() => loadDbConfig());
 * });
 *
 * // Properties are automatically replaced with real values when accessed
 * ```
 */
export function wire<T extends object>(object: T, callback: (this: T) => void) {
    const proxy = new Proxy(object, {
        set(target, p, newValue, receiver) {
            if (isLazilyInstance(newValue)) {
                onInitialized(newValue, (realInstance) => {
                    Reflect.set(target, p, realInstance, receiver);
                });
            }
            return Reflect.set(target, p, newValue, receiver);
        },
    });
    callback.call(proxy);
}
