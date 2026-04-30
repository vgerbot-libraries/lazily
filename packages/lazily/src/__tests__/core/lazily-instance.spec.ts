import { Lazily } from '../../core/Lazily';
import { NotLazilyInstanceError } from '../../core/errors';
import { assertIsLazilyInstance, isLazilyInstance } from '../../core/lazily-instance';
import { lazy } from '../../lib/lazy';

describe('lazily-instance', () => {
    describe('isLazilyInstance', () => {
        it('should return true for Lazily instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            expect(isLazilyInstance(lazily)).toBe(true);
        });

        it('should return true for proxy created by create', () => {
            const instance = lazy(() => ({ value: 42 }));

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
            }).toThrow(NotLazilyInstanceError);
            expect(() => {
                assertIsLazilyInstance({ value: 42 });
            }).toThrow('Expected a lazily instance');
        });
    });
});
