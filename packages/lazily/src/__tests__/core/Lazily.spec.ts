import { Lazily } from '../../core/Lazily';
import {
    InvalidFactoryReturnError,
    InvalidatedLazilyError,
    LazilyFactoryError,
} from '../../core/errors';
import {
    GET,
    INVALIDATE,
    IS_INITIALIZED,
    IS_LAZILY,
    ON_INITIALIZE,
} from '../../core/lazily-instance';

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

        it('should return false for invalidated instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[INVALIDATE]();

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

        it('should throw error when accessing invalidated instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[INVALIDATE]();

            expect(() => {
                lazily[GET]();
            }).toThrow(InvalidatedLazilyError);
            expect(() => {
                lazily[GET]();
            }).toThrow('Cannot access an invalidated lazily instance');
        });

        it('should throw factory error when factory throws', () => {
            const factoryError = new Error('Factory failed');
            const lazily = new Lazily(() => {
                throw factoryError;
            });

            expect(() => {
                lazily[GET]();
            }).toThrow(LazilyFactoryError);
            expect(() => {
                lazily[GET]();
            }).toThrow('Factory function threw an error during lazy initialization');
        });

        it('should throw InvalidFactoryReturnError when factory returns null', () => {
            const lazily = new Lazily((() => null) as unknown as () => object);

            expect(() => {
                lazily[GET]();
            }).toThrow(InvalidFactoryReturnError);
            expect(() => {
                lazily[GET]();
            }).toThrow('Factory function returned an invalid value: null');
        });

        it('should throw InvalidFactoryReturnError when factory returns undefined', () => {
            const lazily = new Lazily((() => undefined) as unknown as () => object);

            expect(() => {
                lazily[GET]();
            }).toThrow(InvalidFactoryReturnError);
            expect(() => {
                lazily[GET]();
            }).toThrow('Factory function returned an invalid value: undefined');
        });

        it('should throw InvalidFactoryReturnError when factory returns a number', () => {
            const lazily = new Lazily((() => 42) as unknown as () => object);

            expect(() => {
                lazily[GET]();
            }).toThrow(InvalidFactoryReturnError);
            expect(() => {
                lazily[GET]();
            }).toThrow('Factory function returned an invalid value: number');
        });

        it('should throw InvalidFactoryReturnError when factory returns a string', () => {
            const lazily = new Lazily((() => 'hello') as unknown as () => object);

            expect(() => {
                lazily[GET]();
            }).toThrow(InvalidFactoryReturnError);
            expect(() => {
                lazily[GET]();
            }).toThrow('Factory function returned an invalid value: string');
        });

        it('should throw InvalidFactoryReturnError when factory returns a boolean', () => {
            const lazily = new Lazily((() => true) as unknown as () => object);

            expect(() => {
                lazily[GET]();
            }).toThrow(InvalidFactoryReturnError);
            expect(() => {
                lazily[GET]();
            }).toThrow('Factory function returned an invalid value: boolean');
        });
    });

    describe('invalidate', () => {
        it('should mark instance as invalidated', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[INVALIDATE]();

            expect(lazily[IS_INITIALIZED]()).toBe(false);
        });

        it('should allow releasing uninitialized instance', () => {
            const lazily = new Lazily(() => ({ value: 42 }));

            expect(() => {
                lazily[INVALIDATE]();
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

        it('should not register callback for invalidated instance', () => {
            const callback = jest.fn();
            const lazily = new Lazily(() => ({ value: 42 }));

            lazily[GET]();
            lazily[INVALIDATE]();

            const unsubscribe = lazily[ON_INITIALIZE](callback);

            expect(unsubscribe).toBeDefined();
            expect(typeof unsubscribe).toBe('function');

            // Callback should not be called since instance is invalidated
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
