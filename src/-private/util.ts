import { Signal } from "signal-polyfill";

/**
 * equality check here is always false so that we can dirty the storage
 * via setting to _anything_
 *
 *
 * This is for a pattern where we don't *directly* use signals to back the values used in collections
 * so that instanceof checks and getters and other native features "just work" without having 
 * to do nested proxying.
 *
 * (though, see deep.ts for nested / deep behavior)
 */
export const createStorage = () => new Signal.State(null, { equals: () => false });
