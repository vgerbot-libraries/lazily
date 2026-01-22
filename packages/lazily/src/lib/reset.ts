import { defineContext, getContext } from '../core/context';
import { assertIsLazilyInstance } from '../core/lazily-instance';

export function reset<T>(instance: T) {
    assertIsLazilyInstance(instance);
    const context = getContext(instance);
    if (!context) {
        return;
    }

    // If released, reset to uninitialized with empty listeners
    if (context.invalidated) {
        defineContext(instance, {
            initialized: false,
            invalidated: false,
            listeners: new Map(),
        });
        return;
    }

    // At this point, context is either UninitializedLazilyContext or InitializedLazilyContext
    // Both have listeners property
    if ('listeners' in context) {
        defineContext(instance, {
            initialized: false,
            invalidated: false,
            listeners: context.listeners,
        });
    }
}
