import { createMarker } from "./maker"
import { LazilyProxyHandler } from "./proxy-handler";

export function create<T extends object>(factory: () => T): T {
    const marker = createMarker();

    return new Proxy(marker as T, new LazilyProxyHandler<T>(factory));
}
