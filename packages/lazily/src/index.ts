export { create } from "./lib/create";
export { isInitialized } from "./lib/isInitialized";
export { onInitialized } from "./lib/onInitialized";
export { release } from "./lib/release";
export { reset } from "./lib/reset";
export { value } from "./lib/value";

// Re-export core types and utilities for advanced usage
export { Lazily } from "./core/Lazily";
export { LazilyProxyHandler } from "./core/proxy-handler";
export {
    isLazilyInstance,
    assertIsLazilyInstance,
    IS_INITIALIZED,
    RELEASE,
    GET,
    ON_INITIALIZE,
    IS_LAZILY,
    type LazilyInstance,
} from "./core/lazily-instance";
export {
    getContext,
    defineContext,
    clearContext,
    isInitializedContext,
    isValidContext,
    type LazilyContext,
    type InitializedLazilyContext,
    type UninitializedLazilyContext,
    type ReleasedLazilyContext,
} from "./core/context";
