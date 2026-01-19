import { defineContext, getContext } from './context';
import { INITIALIZE, IS_INITIALIZED, RELEASE } from './lazily-instance';

export class LazilyProxyHandler<T extends object> implements ProxyHandler<T> {
    constructor(
        private readonly factory: () => T
    ) {
    }
    get(target: T, p: string | symbol, receiver: T) {
        switch (p) {
            case IS_INITIALIZED:
            case RELEASE:
                return Reflect.get(target, p, receiver);
            case INITIALIZE:
                return () => {
                    this._getOrInitialize(target);
                };
        }
        const instance = this._getOrInitialize(target);
        return Reflect.get(instance, p, receiver);
    }
    set(target: T, p: string | symbol, newValue: T, receiver: T): boolean {
        switch (p) {
            case IS_INITIALIZED:
            case RELEASE:
            case INITIALIZE:
                return false;
        }
        const instance = this._getOrInitialize(target);
        return Reflect.set(instance, p, newValue, receiver);
    }
    has(target: T, p: string | symbol): boolean {
        switch (p) {
            case IS_INITIALIZED:
            case RELEASE:
            case INITIALIZE:
                return true;
        }
        const instance = this._getOrInitialize(target);
        return Reflect.has(instance, p);
    }
    ownKeys(target: T): ArrayLike<string | symbol> {
        const instance = this._getOrInitialize(target);
        return Reflect.ownKeys(instance);
    }
    getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
        const instance = this._getOrInitialize(target);

        return Reflect.getOwnPropertyDescriptor(instance, p);
    }
    getPrototypeOf(target: T): object | null {
        const instance = this._getOrInitialize(target);
        return Reflect.getPrototypeOf(instance);
    }

    private _getOrInitialize(object: object) {
        const context = getContext(object);
        if (context?.initialized) {
            return context.value;
        }
        const realInstance = this.factory();
        defineContext(object, {
            value: realInstance,
            initialized: true,
        });
        return realInstance;
    }
}
