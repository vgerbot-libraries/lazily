import { isLazilyInstance } from '../../core/lazily-instance';
import { lazy } from '../../lib/lazy';
import { wire } from '../../lib/wire';

describe('wire', () => {
    it('should replace lazily instance with real value when initialized', () => {
        const target = {} as { service: { value: number } };
        const lazyService = lazy(() => ({ value: 42 }));

        wire(target, function () {
            this.service = lazyService;
        });

        expect(isLazilyInstance(target.service)).toBe(true);
        expect(target.service).toBe(lazyService);

        // Access to initialize
        const _ = target.service.value;

        // After initialization, the service should be replaced with the real value
        expect(isLazilyInstance(target.service)).toBe(false);
        expect(target.service).toEqual({ value: 42 });
        expect(target.service).not.toBe(lazyService);
    });

    it('should handle non-lazily values normally', () => {
        const target = {} as { value: number; name: string };
        const regularValue = 42;
        const regularString = 'test';

        wire(target, function () {
            this.value = regularValue;
            this.name = regularString;
        });

        expect(target.value).toBe(42);
        expect(target.name).toBe('test');
    });

    it('should handle multiple lazily instances', () => {
        const target = {} as {
            service1: { value: number };
            service2: { name: string };
        };
        const lazyService1 = lazy(() => ({ value: 100 }));
        const lazyService2 = lazy(() => ({ name: 'test' }));

        wire(target, function () {
            this.service1 = lazyService1;
            this.service2 = lazyService2;
        });

        expect(isLazilyInstance(target.service1)).toBe(true);
        expect(isLazilyInstance(target.service2)).toBe(true);

        // Initialize first service
        const _ = target.service1.value;
        expect(target.service1).toEqual({ value: 100 });
        expect(isLazilyInstance(target.service1)).toBe(false);
        expect(isLazilyInstance(target.service2)).toBe(true);

        // Initialize second service
        const __ = target.service2.name;
        expect(target.service2).toEqual({ name: 'test' });
        expect(isLazilyInstance(target.service2)).toBe(false);
    });

    it('should call callback with proxy as this', () => {
        const target = {} as { value: number };
        let callbackThis: typeof target | undefined;

        wire(target, function () {
            callbackThis = this;
            this.value = 42;
        });

        expect(callbackThis).toBeDefined();
        expect(callbackThis).not.toBe(target);
        expect(callbackThis?.value).toBe(42);
    });

    it('should allow property reassignment', () => {
        const target = {} as { service: { value: number } };
        const lazyService1 = lazy(() => ({ value: 1 }));
        const lazyService2 = lazy(() => ({ value: 2 }));

        wire(target, function () {
            this.service = lazyService1;
        });

        expect(target.service).toBe(lazyService1);

        // Reassign
        target.service = lazyService2;
        expect(target.service).toBe(lazyService2);

        // Initialize second service
        const _ = target.service.value;
        expect(target.service).toEqual({ value: 2 });
    });

    it('should handle reassignment of lazily instance to non-lazily value', () => {
        const target = {} as { service: { value: number } | number };
        const lazyService = lazy(() => ({ value: 42 }));

        wire(target, function () {
            this.service = lazyService;
        });

        expect(isLazilyInstance(target.service)).toBe(true);

        // Reassign to non-lazily value
        target.service = 100;
        expect(target.service).toBe(100);
        expect(isLazilyInstance(target.service)).toBe(false);
    });

    it('should not intercept nested property assignments', () => {
        const target = {} as { config: { service: { value: number } } };
        const lazyService = lazy(() => ({ value: 42 }));

        wire(target, function () {
            this.config = { service: lazyService };
        });

        // wire only intercepts direct property assignments on the proxy
        // Nested properties are not intercepted, so the lazyService remains as-is
        expect(isLazilyInstance(target.config.service)).toBe(true);

        // Initialize the nested service
        const _ = target.config.service.value;

        // The nested service is still the lazily instance because wire doesn't intercept nested assignments
        expect(isLazilyInstance(target.config.service)).toBe(true);
    });

    it('should handle complex object with multiple properties', () => {
        const target = {} as {
            service: { value: number };
            config: { name: string };
            count: number;
        };
        const lazyService = lazy(() => ({ value: 100 }));
        const lazyConfig = lazy(() => ({ name: 'test' }));

        wire(target, function () {
            this.service = lazyService;
            this.config = lazyConfig;
            this.count = 5;
        });

        expect(isLazilyInstance(target.service)).toBe(true);
        expect(isLazilyInstance(target.config)).toBe(true);
        expect(target.count).toBe(5);

        // Initialize services
        const _ = target.service.value;
        const __ = target.config.name;

        expect(target.service).toEqual({ value: 100 });
        expect(target.config).toEqual({ name: 'test' });
        expect(target.count).toBe(5);
    });

    it('should preserve original object properties', () => {
        const target = { existing: 'property' } as {
            existing: string;
            service: { value: number };
        };
        const lazyService = lazy(() => ({ value: 42 }));

        wire(target, function () {
            this.service = lazyService;
        });

        expect(target.existing).toBe('property');
        expect(isLazilyInstance(target.service)).toBe(true);

        const _ = target.service.value;

        expect(target.existing).toBe('property');
        expect(target.service).toEqual({ value: 42 });
    });

    it('should handle callback that does not set any properties', () => {
        const target = { value: 42 } as { value: number };

        wire(target, () => {
            // Do nothing
        });

        expect(target.value).toBe(42);
    });

    it('should handle setting same lazily instance multiple times', () => {
        const target = {} as {
            service1: { value: number };
            service2: { value: number };
        };
        const lazyService = lazy(() => ({ value: 42 }));

        wire(target, function () {
            this.service1 = lazyService;
            this.service2 = lazyService;
        });

        expect(target.service1).toBe(lazyService);
        expect(target.service2).toBe(lazyService);

        // Initialize through first property
        const _ = target.service1.value;

        // Both should be replaced since they reference the same lazily instance
        expect(target.service1).toEqual({ value: 42 });
        expect(target.service2).toEqual({ value: 42 });
    });
});
