import { isLazilyInstance } from "../core/lazily-instance";
import { onInitialized } from "./onInitialized";

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
