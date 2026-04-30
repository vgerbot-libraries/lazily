import type { Lazily } from '../../core/Lazily';
import { InvalidatedLazilyError } from '../../core/errors';
import { GET } from '../../core/lazily-instance';
import { invalidate } from '../../lib/invalidate';
import { isInitialized } from '../../lib/isInitialized';
import { lazy } from '../../lib/lazy';

describe('invalidate', () => {
    it('should do nothing for non-lazily instance', () => {
        const regularObject = { value: 42 };

        expect(() => {
            invalidate(regularObject);
        }).not.toThrow();
    });

    it('should mark instance as invalidated', () => {
        const instance = lazy(() => ({ value: 42 }));

        // Initialize first
        const _ = instance.value;

        invalidate(instance);

        expect(isInitialized(instance)).toBe(false);
    });

    it('should throw error when accessing invalidated instance', () => {
        const instance = lazy(() => ({ value: 42 }));

        // Initialize
        const _ = instance.value;

        // invalidate
        invalidate(instance);

        expect(() => {
            const lazily = instance as unknown as Lazily<{ value: number }>;
            lazily[GET]();
        }).toThrow(InvalidatedLazilyError);
        expect(() => {
            const lazily = instance as unknown as Lazily<{ value: number }>;
            lazily[GET]();
        }).toThrow('Cannot access an invalidated lazily instance');
    });

    it('should allow releasing uninitialized instance', () => {
        const instance = lazy(() => ({ value: 42 }));

        expect(() => {
            invalidate(instance);
        }).not.toThrow();

        expect(() => {
            const _ = instance.value;
        }).toThrow(InvalidatedLazilyError);
    });
});
