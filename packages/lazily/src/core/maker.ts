import { clearContext, getContext } from './context';
import { INITIALIZE, IS_INITIALIZED, type LazilyInstance, RELEASE } from './lazily-instance';

export const LAZILY_MARKER = Symbol('lazily-marker');
export interface LazilyMarker extends LazilyInstance {
    [LAZILY_MARKER]: true;
}

export function createMarker(): LazilyMarker {
    return {
        [LAZILY_MARKER]: true,
        [IS_INITIALIZED]() {
            const context = getContext(this);
            return context?.initialized ?? false;
        },
        [RELEASE]() {
            clearContext(this);
        },
        [INITIALIZE]() {},
    };
}

export function isMarker(target: unknown): target is LazilyMarker {
    return !!target && typeof target === 'object' && LAZILY_MARKER in target;
}
