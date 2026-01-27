import { Lazily } from '../core/Lazily';
import { setProxyTarget } from '../core/context';
import { LazilyProxyHandler } from '../core/proxy-handler';

export function lazy<T extends object>(factory: () => T): T {
    const lazily = new Lazily<T>(factory);
    const proxy = new Proxy(lazily as T, new LazilyProxyHandler<T>());
    setProxyTarget(proxy, lazily);
    return proxy;
}
