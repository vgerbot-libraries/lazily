/**
 * Custom error classes for lazily library
 */

/**
 * Error code enumeration for programmatic error handling
 */
export enum LazilyErrorCode {
    /**
     * Attempted to access an invalidated lazily instance
     */
    INVALIDATED_ACCESS = 'LAZILY_INVALIDATED_ACCESS',
    /**
     * The provided instance is not a lazily instance
     */
    NOT_LAZILY_INSTANCE = 'LAZILY_NOT_INSTANCE',
    /**
     * Factory function threw an error during initialization
     */
    FACTORY_ERROR = 'LAZILY_FACTORY_ERROR',
    /**
     * Factory function returned an invalid value (null, undefined, or non-object)
     */
    INVALID_FACTORY_RETURN = 'LAZILY_INVALID_FACTORY_RETURN',
}

/**
 * Base error class for all lazily-related errors
 */
export class LazilyError extends Error {
    /**
     * Error code for programmatic error handling
     */
    public readonly code: LazilyErrorCode;

    /**
     * Additional context information about the error
     */
    public readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        code: LazilyErrorCode,
        context?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.context = context;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Thrown when attempting to access an invalidated lazily instance
 */
export class InvalidatedLazilyError extends LazilyError {
    constructor(context?: Record<string, unknown>) {
        super(
            'Cannot access an invalidated lazily instance. The instance has been invalidated and must be reset before it can be accessed again. Use reset() to re-enable access.',
            LazilyErrorCode.INVALIDATED_ACCESS,
            context
        );
    }
}

/**
 * Thrown when a provided value is not a lazily instance
 */
export class NotLazilyInstanceError extends LazilyError {
    constructor(
        value: unknown,
        context?: Record<string, unknown>
    ) {
        const valueType = value === null ? 'null' : typeof value;
        const valueDescription = valueType === 'object'
            ? `object of type ${value?.constructor?.name ?? 'Unknown'}`
            : valueType;

        super(
            `Expected a lazily instance, but received ${valueDescription}. Use lazy() to create a lazily instance.`,
            LazilyErrorCode.NOT_LAZILY_INSTANCE,
            {
                ...context,
                receivedType: valueType,
                receivedValue: value,
            }
        );
    }
}

/**
 * Thrown when the factory function throws an error during initialization
 */
export class LazilyFactoryError extends LazilyError {
    constructor(
        originalError: unknown,
        context?: Record<string, unknown>
    ) {
        const errorMessage = originalError instanceof Error
            ? originalError.message
            : String(originalError);

        super(
            `Factory function threw an error during lazy initialization: ${errorMessage}`,
            LazilyErrorCode.FACTORY_ERROR,
            {
                ...context,
                originalError,
            }
        );

        // Preserve the original error stack if available
        if (originalError instanceof Error && originalError.stack) {
            this.stack = `${this.stack}\n\nOriginal error:\n${originalError.stack}`;
        }
    }
}

/**
 * Thrown when the factory function returns an invalid value (null, undefined, or non-object)
 */
export class InvalidFactoryReturnError extends LazilyError {
    constructor(
        returnValue: unknown,
        context?: Record<string, unknown>
    ) {
        const valueType = returnValue === null ? 'null' : typeof returnValue;
        const valueDescription = valueType === 'object'
            ? `object of type ${returnValue?.constructor?.name ?? 'Unknown'}`
            : valueType;

        super(
            `Factory function returned an invalid value: ${valueDescription}. Factory must return a non-null, non-undefined object that can be proxied.`,
            LazilyErrorCode.INVALID_FACTORY_RETURN,
            {
                ...context,
                returnType: valueType,
                returnValue,
            }
        );
    }
}

