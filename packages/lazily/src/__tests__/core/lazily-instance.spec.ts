import { isLazilyInstance, assertIsLazilyInstance } from '../../core/lazily-instance';
import { Lazily } from '../../core/Lazily';
import { create } from '../../lib/create';

describe('lazily-instance', () => {
    describe('isLazilyInstance', () => {
        it('should return true for Lazily instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            expect(isLazilyInstance(lazily)).toBe(true);
        });

        it('should return true for proxy created by create', () => {
            const instance = create(() => ({ value: 42 }));

            expect(isLazilyInstance(instance)).toBe(true);
        });

        it('should return false for regular objects', () => {
            expect(isLazilyInstance({ value: 42 })).toBe(false);
            expect(isLazilyInstance(null)).toBe(false);
            expect(isLazilyInstance(undefined)).toBe(false);
            expect(isLazilyInstance(42)).toBe(false);
            expect(isLazilyInstance('string')).toBe(false);
        });
    });

    describe('assertIsLazilyInstance', () => {
        it('should not throw for Lazily instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            expect(() => {
                assertIsLazilyInstance(lazily);
            }).not.toThrow();
        });

        it('should throw for non-lazily instance', () => {
            expect(() => {
                assertIsLazilyInstance({ value: 42 });
            }).toThrow(TypeError);
            expect(() => {
                assertIsLazilyInstance({ value: 42 });
            }).toThrow('The specified instance is not lazily!');
        });
    });
});

