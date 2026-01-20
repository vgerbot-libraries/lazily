import { defineContext, getContext } from "../core/context";
import { assertIsLazilyInstance } from "../core/lazily-instance";

export function reset<T>(instance: T) {
    assertIsLazilyInstance(instance);
    const context = getContext(instance);
    if (!context) {
        return;
    }
    if (context.released) {
        throw new ReferenceError("Cannot operate with released lazily instance");
    }

    defineContext(instance, {
        initialized: false,
        released: false,
        listeners: context.listeners,
    });
}
