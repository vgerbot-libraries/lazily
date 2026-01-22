import type { Lazily } from '../../core/Lazily';
import { GET } from '../../core/lazily-instance';
import { create } from '../../lib/create';
import { isInitialized } from '../../lib/isInitialized';
import { invalidate } from '../../lib/invalidate';

describe('invalidate', () => {
    it('should do nothing for non-lazily instance', () => {
        const regularObject = { value: 42 };

        expect(() => {
            invalidate(regularObject);
        }).not.toThrow();
    });

    it('should mark instance as invalidated', () => {
        const instance = create(() => ({ value: 42 }));

        // Initialize first
        const _ = instance.value;

        invalidate(instance);

        expect(isInitialized(instance)).toBe(false);
    });

    it('should throw error when accessing invalidated instance', () => {
        const instance = create(() => ({ value: 42 }));

        // Initialize
        const _ = instance.value;

        // invalidate
        invalidate(instance);

        expect(() => {
            const lazily = instance as unknown as Lazily<{ value: number }>;
            lazily[GET]();
        }).toThrow(ReferenceError);
        expect(() => {
            const lazily = instance as unknown as Lazily<{ value: number }>;
            lazily[GET]();
        }).toThrow('Accessing invalidated lazily variables');
    });

    it('should allow releasing uninitialized instance', () => {
        const instance = create(() => ({ value: 42 }));

        expect(() => {
            invalidate(instance);
        }).not.toThrow();

        expect(() => {
            const _ = instance.value;
        }).toThrow(ReferenceError);
    });
});
