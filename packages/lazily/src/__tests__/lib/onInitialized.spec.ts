import { NotLazilyInstanceError } from '../../core/errors';
import { lazy } from '../../lib/lazy';
import { onInitialized } from '../../lib/onInitialized';

describe('onInitialized', () => {
    it('should throw error for non-lazily instance', () => {
        const regularObject = { value: 42 };

        expect(() => {
            onInitialized(regularObject as object, () => {});
        }).toThrow(NotLazilyInstanceError);
        expect(() => {
            onInitialized(regularObject as object, () => {});
        }).toThrow('Expected a lazily instance');
    });

    it('should call callback when instance is initialized', () => {
        const callback = jest.fn();
        const instance = lazy(() => ({ value: 42 }));

        onInitialized(instance, callback);

        expect(callback).not.toHaveBeenCalled();

        // Access to initialize
        const _ = instance.value;

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ value: 42 });
    });

    it('should call callback immediately if already initialized', () => {
        const callback = jest.fn();
        const instance = lazy(() => ({ value: 42 }));

        // Initialize first
        const _ = instance.value;

        onInitialized(instance, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ value: 42 });
    });

    it('should support multiple callbacks', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const instance = lazy(() => ({ value: 42 }));

        onInitialized(instance, callback1);
        onInitialized(instance, callback2);

        const _ = instance.value;

        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
        const callback = jest.fn();
        const instance = lazy(() => ({ value: 42 }));

        const unsubscribe = onInitialized(instance, callback);

        unsubscribe();

        const _ = instance.value;

        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const instance = lazy(() => ({ value: 42 }));
        const errorCallback = jest.fn(() => {
            throw new Error('Callback error');
        });
        const normalCallback = jest.fn();

        onInitialized(instance, errorCallback);
        onInitialized(instance, normalCallback);

        // Should not throw, but log error
        expect(() => {
            const _ = instance.value;
        }).not.toThrow();

        // Normal callback should still be called
        expect(normalCallback).toHaveBeenCalledTimes(1);
        expect(errorCallback).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Lazily] Error in initialization callback:'),
            'Callback error'
        );

        consoleErrorSpy.mockRestore();
    });
});
