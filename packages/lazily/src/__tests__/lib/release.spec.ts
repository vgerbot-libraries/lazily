import { release } from '../../lib/release';
import { create } from '../../lib/create';
import { isInitialized } from '../../lib/isInitialized';
import { Lazily } from '../../core/Lazily';
import { GET } from '../../core/lazily-instance';

describe('release', () => {
    it('should do nothing for non-lazily instance', () => {
        const regularObject = { value: 42 };

        expect(() => {
            release(regularObject);
        }).not.toThrow();
    });

    it('should mark instance as released', () => {
        const instance = create(() => ({ value: 42 }));

        // Initialize first
        const _ = (instance as any).value;

        release(instance);

        expect(isInitialized(instance)).toBe(false);
    });

    it('should throw error when accessing released instance', () => {
        const instance = create(() => ({ value: 42 }));

        // Initialize
        const _ = (instance as any).value;

        // Release
        release(instance);

        expect(() => {
            const lazily = instance as any as Lazily<{ value: number }>;
            lazily[GET]();
        }).toThrow(ReferenceError);
        expect(() => {
            const lazily = instance as any as Lazily<{ value: number }>;
            lazily[GET]();
        }).toThrow('Accessing released lazily variables');
    });

    it('should allow releasing uninitialized instance', () => {
        const instance = create(() => ({ value: 42 }));

        expect(() => {
            release(instance);
        }).not.toThrow();

        expect(() => {
            const _ = (instance as any).value;
        }).toThrow(ReferenceError);
    });
});
