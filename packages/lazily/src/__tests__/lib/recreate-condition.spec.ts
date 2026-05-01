import { NotLazilyInstanceError } from '../../core/errors';
import {
    IS_LAZILY,
    type LazilyInstance,
    REGISTER_RECREATE_CHECKER,
} from '../../core/lazily-instance';
import { onChange, onRefChange, recreateWhen } from '../../lib/recreate-condition';

describe('recreate-condition', () => {
    describe('recreateWhen', () => {
        it('should throw error for non-lazily instance', () => {
            const regularObject = { value: 42 };

            expect(() => {
                recreateWhen(regularObject, () => false);
            }).toThrow(NotLazilyInstanceError);
            expect(() => {
                recreateWhen(regularObject, () => false);
            }).toThrow('Expected a lazily instance');
        });

        it('should register checker and return disposer', () => {
            const dispose = jest.fn();
            const register = jest.fn(() => dispose);
            const instance = {
                [IS_LAZILY]: true,
                [REGISTER_RECREATE_CHECKER]: register,
            } as unknown as LazilyInstance<object>;
            const checker = jest.fn(() => false);

            const stop = recreateWhen(instance, checker);

            expect(register).toHaveBeenCalledTimes(1);
            expect(register).toHaveBeenCalledWith(checker);
            expect(stop).toBe(dispose);
        });
    });

    describe('onChange', () => {
        it('should return false on first evaluation and track changes', () => {
            let value = 1;
            const when = onChange(() => value);

            expect(when()).toBe(false);
            expect(when()).toBe(false);

            value = 2;
            expect(when()).toBe(true);
            expect(when()).toBe(false);
        });

        it('should use Object.is as default comparator', () => {
            let value = Number.NaN;
            const when = onChange(() => value);

            expect(when()).toBe(false);
            expect(when()).toBe(false);

            value = 1;
            expect(when()).toBe(true);
        });

        it('should support custom comparator', () => {
            let version = 1;
            const isEqual = jest.fn((prev: { version: number }, next: { version: number }) => {
                return prev.version === next.version;
            });
            const when = onChange(() => ({ version, tick: Date.now() }), isEqual);

            expect(when()).toBe(false);
            expect(when()).toBe(false);

            version = 2;
            expect(when()).toBe(true);
            expect(isEqual).toHaveBeenCalledTimes(2);
        });
    });

    describe('onRefChange', () => {
        it('should use strict equality comparator', () => {
            let ref: object = {};
            const when = onRefChange(() => ref);

            expect(when()).toBe(false);
            expect(when()).toBe(false);

            ref = {};
            expect(when()).toBe(true);
            expect(when()).toBe(false);
        });

        it('should treat NaN as changed on every call after initialization', () => {
            const when = onRefChange(() => Number.NaN);

            expect(when()).toBe(false);
            expect(when()).toBe(true);
            expect(when()).toBe(true);
        });
    });
});
