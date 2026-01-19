import { defineContext, getContext } from "./context";
import { IS_INITIALIZED, RELEASE } from "./lazily-instance";
import { LazilyMarker } from "./maker";

export class LazilyProxyHandler<T extends object> implements ProxyHandler<T> {
    private realInstance?: T;
    constructor(private readonly marker: LazilyMarker, private readonly factory: () => T) {}
    get(target: any, p: string | symbol, receiver: any) {
        switch(p) {
            case IS_INITIALIZED:
            case RELEASE:
                return Reflect.get(target, p, receiver);
        }
    }
    set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
        return true;
    }
    has(target: any, p: string | symbol): boolean {
        return true;
    }
    ownKeys(target: any): ArrayLike<string | symbol> {
        return [];
    }
    getOwnPropertyDescriptor(target: any, p: string | symbol): PropertyDescriptor | undefined {
        return
    }
    // instanceof 
    getPrototypeOf(target: any): object | null {
        return null;
    }
    
    private _getOrInitialize(object: object) {
        const context = getContext(object);
        if(context?.initialized) {
            return context.value;
        } else {
            const realInstance = (this.factory)();
            defineContext(object, {
                owner: null,
                value: realInstance,
                initialized: true,
                
            })
        }
    }
}
