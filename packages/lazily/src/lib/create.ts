import { Lazily } from "../core/Lazily";
import { LazilyProxyHandler } from "../core/proxy-handler";

export function create<T extends object>(factory: () => T): T {
    const lazily = new Lazily<T>(factory);
    return new Proxy(lazily as T, new LazilyProxyHandler<T>());
}
