import { getContext, isInitializedContext } from "../core/context";
import { isLazily } from "../core/maker";

export function isInitialized(instance: unknown) {
    if (!isLazily(instance)) {
        return true;
    }
    const context = getContext(instance);
    return isInitializedContext(context);
}
