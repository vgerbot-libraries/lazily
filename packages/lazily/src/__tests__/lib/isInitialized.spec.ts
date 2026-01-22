import { create } from '../../lib/create';
import { isInitialized } from '../../lib/isInitialized';
import { release } from '../../lib/release';

describe('isInitialized', () => {
    it('should return true for non-lazily instances', () => {
        expect(isInitialized({ value: 42 })).toBe(true);
        expect(isInitialized(null)).toBe(true);
        expect(isInitialized(undefined)).toBe(true);
        expect(isInitialized(42)).toBe(true);
        expect(isInitialized('string')).toBe(true);
    });

    it('should return false for uninitialized lazily instance', () => {
        const instance = create(() => ({ value: 42 }));

        expect(isInitialized(instance)).toBe(false);
    });

    it('should return true for initialized lazily instance', () => {
        const instance = create(() => ({ value: 42 }));

        // Access the instance to initialize it
        const _ = instance.value;

        expect(isInitialized(instance)).toBe(true);
    });

    it('should return false for released lazily instance', () => {
        const instance = create(() => ({ value: 42 }));

        // Initialize
        const _ = instance.value;

        // Release
        release(instance);

        expect(isInitialized(instance)).toBe(false);
    });
});
