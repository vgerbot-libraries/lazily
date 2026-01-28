/**
 * @vgerbot/lazily - A TypeScript library for lazy initialization
 *
 * This library provides utilities for deferring object creation until first access,
 * improving application startup time and resource usage.
 *
 * @packageDocumentation
 */

/**
 * Creates a lazily-initialized proxy object
 * @see {@link lazy} for implementation details
 */
export { lazy } from './lib/lazy';

/**
 * Checks if a lazily instance has been initialized
 * @see {@link isInitialized} for implementation details
 */
export { isInitialized } from './lib/isInitialized';

/**
 * Registers a callback to be invoked when a lazily instance is initialized
 * @see {@link onInitialized} for implementation details
 */
export { onInitialized } from './lib/onInitialized';

/**
* Registers a callback to be invoked when a lazily instance is invalidated
* @see {@link onInvalidate } for implementation details
*/
export { onInvalidate } from './lib/onInvalidate'

/**
 * Invalidates a lazily instance, preventing further access
 * @see {@link invalidate} for implementation details
 */
export { invalidate } from './lib/invalidate';

/**
 * Resets a lazily instance to its uninitialized state
 * @see {@link reset} for implementation details
 */
export { reset } from './lib/reset';

/**
 * Creates a lazily-initialized value with an explicit get() method
 * @see {@link value} for implementation details
 */
export { value } from './lib/value';

/**
 * Wires up an object to automatically replace lazily instances with their initialized values
 * @see {@link wire} for implementation details
 */
export { wire } from './lib/wire';

/**
 * Error classes for programmatic error handling
 *
 * - {@link LazilyError} - Base error class for all lazily-related errors
 * - {@link InvalidatedLazilyError} - Thrown when accessing an invalidated instance
 * - {@link NotLazilyInstanceError} - Thrown when a non-lazily instance is provided
 * - {@link LazilyFactoryError} - Thrown when the factory function throws an error
 * - {@link LazilyErrorCode} - Enum of error codes for programmatic handling
 */
export {
    LazilyError,
    InvalidatedLazilyError,
    NotLazilyInstanceError,
    LazilyFactoryError,
    InvalidFactoryReturnError,
    LazilyErrorCode,
} from './core/errors';
