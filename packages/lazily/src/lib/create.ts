import { Lazily } from '../core/Lazily';
import { LazilyProxyHandler } from '../core/proxy-handler';
import { setProxyTarget } from '../core/context';

export function create<T extends object>(factory: () => T): T {
    const lazily = new Lazily<T>(factory);
    const proxy = new Proxy(lazily as T, new LazilyProxyHandler<T>());
    setProxyTarget(proxy, lazily);
    return proxy;
}
