import { Lazily } from '../../core/Lazily';
import {
    type LazilyContext,
    clearContext,
    getContext,
    isInitializedContext,
    isValidContext,
} from '../../core/context';
import { GET, INVALIDATE, ON_INITIALIZE } from '../../core/lazily-instance';

describe('context', () => {
    describe('getContext', () => {
        it('should return undefined for instance without context', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            expect(getContext(lazily)).toBeUndefined();
        });

        it('should return context after initialization', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();

            const context = getContext(lazily);
            expect(context).toBeDefined();
            expect(isInitializedContext(context)).toBe(true);
        });
    });

    describe('isInitializedContext', () => {
        it('should return false for undefined', () => {
            expect(isInitializedContext(undefined)).toBe(false);
        });

        it('should return false for uninitialized context', () => {
            const lazily = new Lazily(() => ({ value: 42 }));
            const context = getContext(lazily);

            // Context doesn't exist yet, so it's not initialized
            expect(isInitializedContext(context)).toBe(false);
        });

        it('should return true for initialized context', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            const context = getContext(lazily);

            expect(isInitializedContext(context)).toBe(true);
        });

        it('should return false for invalidated context', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[INVALIDATE]();

            const context = getContext(lazily);
            expect(isInitializedContext(context)).toBe(false);
        });
    });

    describe('isValidContext', () => {
        it('should return false for undefined', () => {
            expect(isValidContext(undefined as unknown as LazilyContext<object>)).toBe(false);
        });

        it('should return true for uninitialized context', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            // Create uninitialized context by registering a callback
            lazily[ON_INITIALIZE](() => {});

            const context = getContext(lazily);
            expect(context).toBeDefined();
            if (context) {
                expect(isValidContext(context)).toBe(true);
            }
        });

        it('should return true for initialized context', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            const context = getContext(lazily);

            expect(context).toBeDefined();
            if (context) {
                expect(isValidContext(context)).toBe(true);
            }
        });

        it('should return false for invalidated context', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[INVALIDATE]();

            const context = getContext(lazily);
            expect(context).toBeDefined();
            if (context) {
                expect(isValidContext(context)).toBe(false);
            }
        });
    });

    describe('clearContext', () => {
        it('should remove context from instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            expect(getContext(lazily)).toBeDefined();

            clearContext(lazily);
            expect(getContext(lazily)).toBeUndefined();
        });
    });
});
