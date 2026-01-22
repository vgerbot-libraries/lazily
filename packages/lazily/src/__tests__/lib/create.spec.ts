import { create } from '../../lib/create';
import { isLazilyInstance } from '../../core/lazily-instance';
import { Lazily } from '../../core/Lazily';
import { LazilyProxyHandler } from '../../core/proxy-handler';
import { IS_LAZILY } from '../../core/lazily-instance';

describe('create', () => {
    it('should create a lazily instance', () => {
        const factory = jest.fn(() => ({ value: 42 }));
        const instance = create(factory);

        expect(isLazilyInstance(instance)).toBe(true);
        expect(factory).not.toHaveBeenCalled();
    });

    it('should not call factory until first access', () => {
        const factory = jest.fn(() => ({ value: 42 }));
        const instance = create(factory);

        expect(factory).not.toHaveBeenCalled();

        const result = (instance as any).value;
        expect(factory).toHaveBeenCalledTimes(1);
        expect(result).toBe(42);
    });

    it('should only call factory once', () => {
        const factory = jest.fn(() => ({ value: 42 }));
        const instance = create(factory);

        const value1 = (instance as any).value;
        const value2 = (instance as any).value;
        const value3 = (instance as any).value;

        expect(factory).toHaveBeenCalledTimes(1);
        expect(value1).toBe(42);
        expect(value2).toBe(42);
        expect(value3).toBe(42);
    });

    it('should handle complex objects', () => {
        class TestClass {
            public value: number;
            public name: string;

            constructor() {
                this.value = 100;
                this.name = 'test';
            }

            getValue() {
                return this.value;
            }
        }

        const instance = create(() => new TestClass());

        expect((instance as any).value).toBe(100);
        expect((instance as any).name).toBe('test');
        expect((instance as any).getValue()).toBe(100);
    });

    it('should handle property assignment', () => {
        const instance = create(() => ({ value: 42 }));

        (instance as any).value = 100;
        expect((instance as any).value).toBe(100);
    });

    it('should handle property existence checks', () => {
        const instance = create(() => ({ value: 42, name: 'test' }));

        expect('value' in instance).toBe(true);
        expect('name' in instance).toBe(true);
        expect('nonexistent' in instance).toBe(false);
    });

    it('should handle ownKeys', () => {
        const instance = create(() => ({ value: 42, name: 'test' }));

        const keys = Object.keys(instance);
        expect(keys).toContain('value');
        expect(keys).toContain('name');
    });

    it('should handle getOwnPropertyDescriptor', () => {
        const instance = create(() => ({ value: 42 }));

        const descriptor = Object.getOwnPropertyDescriptor(instance, 'value');
        expect(descriptor).toBeDefined();
        expect(descriptor?.value).toBe(42);
    });

    it('should handle getPrototypeOf', () => {
        class TestClass {}
        const instance = create(() => new TestClass());

        const proto = Object.getPrototypeOf(instance);
        expect(proto).toBe(TestClass.prototype);
    });

    it('should preserve target properties', () => {
        const lazily = new Lazily(() => ({ value: 42 }));
        const proxy = new Proxy(lazily as any, new LazilyProxyHandler());

        // IS_LAZILY should be accessible directly
        expect(proxy[IS_LAZILY]).toBe(true);
    });
});
