import { Lazily } from '../../core/Lazily';
import { IS_LAZILY } from '../../core/lazily-instance';
import { LazilyProxyHandler } from '../../core/proxy-handler';

describe('LazilyProxyHandler', () => {
    it('should delegate property access to instance', () => {
        const lazily = new Lazily(() => ({ value: 42 }));
        const handler = new LazilyProxyHandler();
        const proxy = new Proxy(lazily as unknown as { value: number }, handler) as {
            value: number;
        };

        expect(proxy.value).toBe(42);
    });

    it('should delegate property setting to instance', () => {
        const lazily = new Lazily(() => ({ value: 42 }));
        const handler = new LazilyProxyHandler();
        const proxy = new Proxy(lazily as unknown as { value: number }, handler) as {
            value: number;
        };

        proxy.value = 100;
        expect(proxy.value).toBe(100);
    });

    it('should check property existence on instance', () => {
        const lazily = new Lazily(() => ({ value: 42, name: 'test' }));
        const handler = new LazilyProxyHandler();
        const proxy = new Proxy(lazily as unknown as { value: number; name: string }, handler) as {
            value: number;
        };

        expect('value' in proxy).toBe(true);
        expect('name' in proxy).toBe(true);
        expect('nonexistent' in proxy).toBe(false);
    });

    it('should return own keys from instance', () => {
        const lazily = new Lazily(() => ({ value: 42, name: 'test' }));
        const handler = new LazilyProxyHandler();
        const proxy = new Proxy(lazily as unknown as { value: number; name: string }, handler);

        const keys = Object.keys(proxy);
        expect(keys).toContain('value');
        expect(keys).toContain('name');
    });

    it('should return property descriptor from instance', () => {
        const lazily = new Lazily(() => ({ value: 42 }));
        const handler = new LazilyProxyHandler();
        const proxy = new Proxy(lazily as unknown as { value: number }, handler);

        const descriptor = Object.getOwnPropertyDescriptor(proxy, 'value');
        expect(descriptor).toBeDefined();
        expect(descriptor?.value).toBe(42);
    });

    it('should return prototype from instance', () => {
        class TestClass {}
        const lazily = new Lazily(() => new TestClass());
        const handler = new LazilyProxyHandler();
        const proxy = new Proxy(lazily as TestClass, handler);

        const proto = Object.getPrototypeOf(proxy);
        expect(proto).toBe(TestClass.prototype);
    });

    it('should preserve target properties', () => {
        const lazily = new Lazily(() => ({ value: 42 }));
        const handler = new LazilyProxyHandler();
        const proxy = new Proxy(lazily as unknown as { value: number }, handler);

        // IS_LAZILY should be accessible
        expect((proxy as Lazily<{ value: number }>)[IS_LAZILY]).toBe(true);
    });

    it('should not allow setting target properties', () => {
        const lazily = new Lazily(() => ({ value: 42 }));
        const handler = new LazilyProxyHandler();
        const proxy = new Proxy(lazily as unknown as { value: number }, handler);

        // Setting a property that exists on target should return false
        const result = Reflect.set(proxy, IS_LAZILY, false, proxy);
        expect(result).toBe(false);
    });
});
