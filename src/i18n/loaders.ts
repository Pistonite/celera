import type { LoadLanguageFn } from "./types.ts";
import i18next from "i18next";

import { log } from "#util";

const namedspacedLoaders: Map<string, LoadLanguageFn> = new Map();
const namespacedAwaiters: Map<string, ((loader: LoadLanguageFn) => void)[]> = new Map();

/** Register a translation loader for a namespace */
export const registerTranslationLoader = async (
    namespace: string,
    loader: LoadLanguageFn,
): Promise<void> => {
    if (namedspacedLoaders.has(namespace)) {
        log.error(`translation namespace '${namespace}' is already registered`);
        return;
    }
    namedspacedLoaders.set(namespace, loader);
    const awaiters = namespacedAwaiters.get(namespace);
    if (awaiters) {
        namespacedAwaiters.delete(namespace);
        awaiters.forEach((x) => x(loader));
    }
    await i18next.loadNamespaces(namespace);
};

export const getTranslationLoaderForNamespace = (namespace: string): Promise<LoadLanguageFn> => {
    const loader = namedspacedLoaders.get(namespace);
    if (loader) {
        return Promise.resolve(loader);
    }
    return new Promise((resolve) => {
        const awaiters = namespacedAwaiters.get(namespace);
        if (awaiters) {
            awaiters.push(resolve);
        } else {
            namespacedAwaiters.set(namespace, [resolve]);
        }
    });
};
