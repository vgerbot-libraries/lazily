import { reset } from '../../lib/reset';
import { create } from '../../lib/create';
import { isInitialized } from '../../lib/isInitialized';
import { release } from '../../lib/release';
import { onInitialized } from '../../lib/onInitialized';

describe('reset', () => {
    it('should throw error for non-lazily instance', () => {
        const regularObject = { value: 42 };

        expect(() => {
            reset(regularObject as any);
        }).toThrow(TypeError);
    });

    it('should reset initialized instance to uninitialized', () => {
        const instance = create(() => ({ value: 42 }));

        // Initialize
        const _ = (instance as any).value;
        expect(isInitialized(instance)).toBe(true);

        // Reset
        reset(instance);
        expect(isInitialized(instance)).toBe(false);

        // Should reinitialize on next access
        const value = (instance as any).value;
        expect(value).toBe(42);
    });

    it('should preserve listeners after reset', () => {
        const callback = jest.fn();
        const instance = create(() => ({ value: 42 }));

        onInitialized(instance, callback);

        // Initialize
        const _ = (instance as any).value;
        expect(callback).toHaveBeenCalledTimes(1);

        // Reset
        reset(instance);

        // Reinitialize
        const __ = (instance as any).value;
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should allow resetting released instance', () => {
        const instance = create(() => ({ value: 42 }));

        // Initialize and release
        const _ = (instance as any).value;
        release(instance);

        // Should be able to reset released instance
        expect(() => {
            reset(instance);
        }).not.toThrow();

        expect(isInitialized(instance)).toBe(false);

        // Should be able to reinitialize after reset
        const value = (instance as any).value;
        expect(value).toBe(42);
    });

    it('should handle reset of uninitialized instance', () => {
        const instance = create(() => ({ value: 42 }));

        expect(() => {
            reset(instance);
        }).not.toThrow();

        expect(isInitialized(instance)).toBe(false);
    });
});

