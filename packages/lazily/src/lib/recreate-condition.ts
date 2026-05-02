import { NotLazilyInstanceError } from '../core/errors';
import { REGISTER_RECREATE_CHECKER, isLazilyInstance } from '../core/lazily-instance';

/**
 * Registers a recreation predicate for a lazily instance.
 *
 * `when` is evaluated before each value access.
 * When it returns `true`, the current cached value is treated as stale and
 * the lazily instance is recreated before continuing the access.
 *
 * `when` can be a plain predicate or a composed predicate built with
 * {@link when} and condition tokens.
 *
 * @throws {NotLazilyInstanceError}
 * Throws when `instance` is not created by `lazy(...)`.
 *
 * @param instance - A lazily instance created by `lazy(...)`.
 * @param when - A predicate that decides whether to recreate on each access.
 * @returns A disposer function that unregisters this predicate.
 *
 * @example
 * ```ts
 * let token = 'v1';
 * const service = lazy(() => createService(token));
 *
 * const stop = recreateWhen(service, () => token !== service.token);
 *
 * service.request(); // uses token v1
 * token = 'v2';
 * service.request(); // service is recreated before access
 *
 * // Optional: stop automatic recreate checks
 * stop();
 * ```
 *
 * @example
 * ```ts
 * let version = 1;
 * const repo = lazy(() => createRepo({ version }));
 *
 * const stop = recreateWhen(
 *   repo,
 *   onChange(() => version)
 * );
 *
 * repo.fetch(); // uses version 1
 * version = 2;
 * repo.fetch(); // repo is recreated because snapshot changed
 *
 * stop();
 * ```
 *
 * @example
 * ```ts
 * const stop = recreateWhen(
 *   viewportService,
 *   when(token =>
 *     token.or(
 *       token.refChange(() => window.innerHeight),
 *       token.refChange(() => window.innerWidth),
 *     ),
 *   ),
 * );
 *
 * stop();
 * ```
 */
export function recreateWhen<T extends object>(instance: T, when: () => boolean) {
    if (!isLazilyInstance(instance)) {
        throw new NotLazilyInstanceError(instance, {
            functionName: 'onInvalidate',
        });
    }
    return instance[REGISTER_RECREATE_CHECKER](when);
}

export type Comparator<T> = (prev: T, next: T) => boolean;

export type ConditionNode = () => boolean;

export type ConditionLike = boolean | ConditionNode;

export interface ConditionToken {
    refChange<T>(snapshot: () => T): ConditionNode;
    changed<T>(snapshot: () => T, isEqual?: Comparator<T>): ConditionNode;
    and(...conditions: ConditionLike[]): ConditionNode;
    or(...conditions: ConditionLike[]): ConditionNode;
    not(condition: ConditionLike): ConditionNode;
}

function resolveCondition(condition: ConditionLike): boolean {
    if (typeof condition === 'function') {
        return condition();
    }
    return condition;
}

function createConditionToken(): ConditionToken {
    return {
        refChange: onRefChange,
        changed: onChange,
        and:
            (...conditions) =>
            () =>
                conditions.every(resolveCondition),
        or:
            (...conditions) =>
            () =>
                conditions.some(resolveCondition),
        not: (condition) => () => !resolveCondition(condition),
    };
}

/**
 * Creates a composable recreation predicate using a condition token.
 *
 * The `callback` is executed once to build a reusable condition graph.
 * Returned predicate evaluates the graph on each access.
 */
export function when(callback: (token: ConditionToken) => ConditionLike): () => boolean {
    const token = createConditionToken();
    const condition = callback(token);
    return () => resolveCondition(condition);
}

/**
 * Builds a recreation predicate by comparing consecutive snapshots.
 *
 * Each invocation compares the previous and current snapshot values.
 * It returns `true` when `isEqual(prev, next)` is `false`.
 *
 * @param snapshot - Produces the current value to compare.
 * @param isEqual - Equality comparator. Defaults to `Object.is`.
 * @returns A zero-arg predicate suitable for `recreateWhen`.
 */
export function onChange<T>(snapshot: () => T, isEqual: Comparator<T> = Object.is): () => boolean {
    let initialized = false;
    let prev!: T;

    return () => {
        const next = snapshot();

        if (!initialized) {
            initialized = true;
            prev = next;
            return false;
        }

        const changed = !isEqual(prev, next);
        prev = next;
        return changed;
    };
}

/**
 * Convenience wrapper of `onChange` using strict equality (`===`).
 */
export const onRefChange = <T>(snapshot: () => T) => onChange(snapshot, (a, b) => a === b);
