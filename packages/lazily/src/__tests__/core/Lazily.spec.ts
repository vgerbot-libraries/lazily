import { Lazily } from '../../core/Lazily';
import { IS_INITIALIZED, RELEASE, GET, ON_INITIALIZE, IS_LAZILY } from '../../core/lazily-instance';

describe('Lazily', () => {
    describe('IS_LAZILY', () => {
        it('should have IS_LAZILY property', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            expect(lazily[IS_LAZILY]).toBe(true);
        });
    });

    describe('IS_INITIALIZED', () => {
        it('should return false for uninitialized instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            expect(lazily[IS_INITIALIZED]()).toBe(false);
        });

        it('should return true for initialized instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();

            expect(lazily[IS_INITIALIZED]()).toBe(true);
        });

        it('should return false for released instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[RELEASE]();

            expect(lazily[IS_INITIALIZED]()).toBe(false);
        });
    });

    describe('GET', () => {
        it('should call factory on first access', () => {
            const factory = jest.fn(() => ({ value: 42 }));
            const lazily = new Lazily(factory);

            const result = lazily[GET]();

            expect(factory).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ value: 42 });
        });

        it('should return same instance on subsequent calls', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            const result1 = lazily[GET]();
            const result2 = lazily[GET]();

            expect(result1).toBe(result2);
        });

        it('should throw error when accessing released instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[RELEASE]();

            expect(() => {
                lazily[GET]();
            }).toThrow(ReferenceError);
            expect(() => {
                lazily[GET]();
            }).toThrow('Accessing released lazily variables');
        });
    });

    describe('RELEASE', () => {
        it('should mark instance as released', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[RELEASE]();

            expect(lazily[IS_INITIALIZED]()).toBe(false);
        });

        it('should allow releasing uninitialized instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            expect(() => {
                lazily[RELEASE]();
            }).not.toThrow();
        });
    });

    describe('ON_INITIALIZE', () => {
        it('should register callback', () => {
            const callback = jest.fn();
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[ON_INITIALIZE](callback);

            expect(callback).not.toHaveBeenCalled();

            lazily[GET]();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({ value: 42 });
        });

        it('should call callback immediately if already initialized', () => {
            const callback = jest.fn();
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[ON_INITIALIZE](callback);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should return unsubscribe function', () => {
            const callback = jest.fn();
            const lazily = new Lazily(() => ({ value: 42 }));

            const unsubscribe = lazily[ON_INITIALIZE](callback);
            unsubscribe();

            lazily[GET]();

            expect(callback).not.toHaveBeenCalled();
        });

        it('should handle multiple callbacks', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[ON_INITIALIZE](callback1);
            lazily[ON_INITIALIZE](callback2);

            lazily[GET]();

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });

        it('should not register callback for released instance', () => {
            const callback = jest.fn();
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[RELEASE]();

            const unsubscribe = lazily[ON_INITIALIZE](callback);

            expect(unsubscribe).toBeDefined();
            expect(typeof unsubscribe).toBe('function');

            // Callback should not be called since instance is released
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
