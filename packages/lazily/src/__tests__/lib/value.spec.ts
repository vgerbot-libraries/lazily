import { value } from '../../lib/value';

describe('value', () => {
    it('should create instance with get method', () => {
        const factory = jest.fn(() => ({ value: 42 }));
        const instance = value(factory);

        expect(typeof instance.get).toBe('function');
        expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory when get is called', () => {
        const factory = jest.fn(() => ({ value: 42 }));
        const instance = value(factory);

        const result = instance.get();

        expect(factory).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ value: 42 });
    });

    it('should only call factory once', () => {
        const factory = jest.fn(() => ({ value: 42 }));
        const instance = value(factory);

        const result1 = instance.get();
        const result2 = instance.get();
        const result3 = instance.get();

        expect(factory).toHaveBeenCalledTimes(1);
        expect(result1).toEqual({ value: 42 });
        expect(result2).toEqual({ value: 42 });
        expect(result3).toEqual({ value: 42 });
    });

    it('should return same instance on multiple get calls', () => {
        const instance = value(() => ({ value: 42 }));

        const result1 = instance.get();
        const result2 = instance.get();

        expect(result1).toBe(result2);
    });
});
