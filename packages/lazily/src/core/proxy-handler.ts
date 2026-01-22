import { Lazily } from './Lazily';
import { GET } from './lazily-instance';

export class LazilyProxyHandler<T extends object> implements ProxyHandler<T> {
    get(target: T, p: string | symbol, receiver: T) {
        if (Reflect.has(target, p)) {
            return Reflect.get(target, p, receiver);
        }
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.get(instance, p, receiver);
    }
    set(target: T, p: string | symbol, newValue: T, receiver: T): boolean {
        if (Reflect.has(target, p)) {
            return false;
        }
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.set(instance, p, newValue, receiver);
    }
    has(target: T, p: string | symbol): boolean {
        if (Reflect.has(target, p)) {
            return true;
        }
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.has(instance, p);
    }
    ownKeys(target: T): ArrayLike<string | symbol> {
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.ownKeys(instance);
    }
    getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
        const instance = (target as Lazily<T>)[GET]();

        return Reflect.getOwnPropertyDescriptor(instance, p);
    }
    getPrototypeOf(target: T): object | null {
        const instance = (target as Lazily<T>)[GET]();
        return Reflect.getPrototypeOf(instance);
    }
}
