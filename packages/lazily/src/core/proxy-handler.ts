import type { Lazily } from './Lazily';
import { GET } from './lazily-instance';

/**
 * Proxy handler that transparently forwards operations to the lazily-initialized instance
 * This handler intercepts property access and other operations, delegating them to the
 * underlying value once it's initialized. Properties on the Lazily instance itself
 * (like internal symbols) are accessed directly without triggering initialization.
 *
 * @template T - The type of the underlying object
 * @internal
 */
export class LazilyProxyHandler<T extends object> implements ProxyHandler<T> {
    /**
     * Intercepts property access
     * If the property exists on the Lazily instance itself, returns it directly.
     * Otherwise, initializes the instance if needed and returns the property from it.
     *
     * @param target - The Lazily instance
     * @param p - The property key being accessed
     * @param receiver - The proxy or an object that inherits from the proxy
     * @returns The property value
     */
    get(target: T, p: string | symbol, receiver: T) {
        if (Reflect.has(target, p)) {
            return Reflect.get(target, p, receiver);
        }
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.get(instance, p, receiver);
    }

    /**
     * Intercepts property assignment
     * Properties on the Lazily instance itself cannot be set.
     * Otherwise, initializes the instance if needed and sets the property on it.
     *
     * @param target - The Lazily instance
     * @param p - The property key being set
     * @param newValue - The new value to set
     * @param receiver - The proxy or an object that inherits from the proxy
     * @returns True if the property was set successfully, false otherwise
     */
    set(target: T, p: string | symbol, newValue: T, receiver: T): boolean {
        if (Reflect.has(target, p)) {
            return false;
        }
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.set(instance, p, newValue, receiver);
    }

    /**
     * Intercepts the 'in' operator
     * Checks if the property exists on the Lazily instance or the underlying value.
     *
     * @param target - The Lazily instance
     * @param p - The property key to check
     * @returns True if the property exists, false otherwise
     */
    has(target: T, p: string | symbol): boolean {
        if (Reflect.has(target, p)) {
            return true;
        }
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.has(instance, p);
    }

    /**
     * Intercepts Object.keys(), Object.getOwnPropertyNames(), etc.
     * Returns the keys from the underlying initialized instance.
     *
     * @param target - The Lazily instance
     * @returns Array of property keys
     */
    ownKeys(target: T): ArrayLike<string | symbol> {
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.ownKeys(instance);
    }

    /**
     * Intercepts Object.getOwnPropertyDescriptor()
     * Returns the property descriptor from the underlying initialized instance.
     *
     * @param target - The Lazily instance
     * @param p - The property key
     * @returns The property descriptor, or undefined if not found
     */
    getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
        const instance = (target as Lazily<T>)[GET]();

        return Reflect.getOwnPropertyDescriptor(instance, p);
    }

    /**
     * Intercepts Object.getPrototypeOf()
     * Returns the prototype of the underlying initialized instance.
     *
     * @param target - The Lazily instance
     * @returns The prototype object, or null
     */
    getPrototypeOf(target: T): object | null {
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.getPrototypeOf(instance);
    }
}
