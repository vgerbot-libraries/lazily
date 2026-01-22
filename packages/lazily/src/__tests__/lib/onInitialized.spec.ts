import { onInitialized } from '../../lib/onInitialized';
import { create } from '../../lib/create';

describe('onInitialized', () => {
    it('should throw error for non-lazily instance', () => {
        const regularObject = { value: 42 };

        expect(() => {
            onInitialized(regularObject as any, () => {});
        }).toThrow(TypeError);
    });

    it('should call callback when instance is initialized', () => {
        const callback = jest.fn();
        const instance = create(() => ({ value: 42 }));

        onInitialized(instance, callback);

        expect(callback).not.toHaveBeenCalled();

        // Access to initialize
        const _ = (instance as any).value;

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ value: 42 });
    });

    it('should call callback immediately if already initialized', () => {
        const callback = jest.fn();
        const instance = create(() => ({ value: 42 }));

        // Initialize first
        const _ = (instance as any).value;

        onInitialized(instance, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ value: 42 });
    });

    it('should support multiple callbacks', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const instance = create(() => ({ value: 42 }));

        onInitialized(instance, callback1);
        onInitialized(instance, callback2);

        const _ = (instance as any).value;

        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
        const callback = jest.fn();
        const instance = create(() => ({ value: 42 }));

        const unsubscribe = onInitialized(instance, callback);

        unsubscribe();

        const _ = (instance as any).value;

        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
        const instance = create(() => ({ value: 42 }));
        const errorCallback = jest.fn(() => {
            throw new Error('Callback error');
        });

        onInitialized(instance, errorCallback);

        expect(() => {
            const _ = (instance as any).value;
        }).toThrow('Callback error');
    });
});
