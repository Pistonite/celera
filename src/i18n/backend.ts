import type { BackendModule } from "i18next";

import { log } from "#util";

import { convertToSupportedLocale } from "./state.ts";
import { getTranslationLoaderForNamespace } from "./loaders.ts";
import type { LoadLanguageFn } from "./types.ts";

/** Create an i18next backend module given the loader functions */
export const createBackend = (
    defaultLoader: LoadLanguageFn | undefined,
    fallbackLocale: string,
): BackendModule => {
    const backend: BackendModule = {
        type: "backend",
        init: () => {
            // no init needed
        },
        read: async (language: string, namespace: string) => {
            if (language === "dev") {
                // don't load the default translation namespace
                return undefined;
            }
            const locale = convertToSupportedLocale(language) || fallbackLocale;
            const isDefaultNamespace = namespace === "translation" || !namespace;
            let loader: LoadLanguageFn;
            if (isDefaultNamespace) {
                if (!defaultLoader) {
                    log.error("default namespace translation loader is not registered");
                    return undefined;
                }
                loader = defaultLoader;
            } else {
                loader = await getTranslationLoaderForNamespace(namespace);
            }
            try {
                const strings = await loader(locale);
                if (strings) {
                    return strings;
                }
            } catch (e) {
                log.error(e);
            }
            if (locale === fallbackLocale) {
                log.warn(`failed to load ${namespace} for ${locale}`);
                return undefined;
            }
            log.warn(
                `failed to load ${namespace} for ${locale}, falling back to ${fallbackLocale}`,
            );
            try {
                const strings = await loader(fallbackLocale);
                if (strings) {
                    return strings;
                }
            } catch (e) {
                log.error(e);
            }
            log.warn(`failed to load ${namespace} for fallback locale ${fallbackLocale}`);
            return undefined;
        },
    };

    return backend;
};
