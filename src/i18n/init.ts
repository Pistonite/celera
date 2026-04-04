import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { convertToSupportedLocaleIn, initLocaleState } from "./state.ts";
import { syncI18nextToCeleraModule } from "./integration.ts";
import type { LocaleOptions } from "./types.ts";
import { createBackend } from "./backend.ts";
import Strings from "./strings.yaml";

export const CELERA_NAMESPACE = "celerans";

/**
 * Initialize locale system in Pure and connect it with I18next
 *
 * This function calls `initLocale` internally, so you don't need to do that yourself.
 */
export const initLocale = async <TLocale extends string>(
    options: LocaleOptions<TLocale>,
) => {
    const defaultLocale = options.default;
    let instance = i18next;
    const syncMode = options.sync || "full";
    const syncPureToI18next = syncMode === "full" || syncMode === "celera-i18next";
    const syncI18nextToPure = syncMode === "full" || syncMode === "i18next-celera";

    if (syncPureToI18next) {
        const onBeforeChangeOriginal = options.onBeforeChange;
        options = {
            ...options,
            onBeforeChange: async (newLocale, checkCancel) => {
                if (instance.language !== newLocale) {
                    await instance.changeLanguage(newLocale);
                }
                await onBeforeChangeOriginal?.(newLocale, checkCancel);
            },
        };
    }

    initLocaleState(options);

    if (syncI18nextToPure) {
        instance = instance.use(syncI18nextToCeleraModule);
    }

    instance = instance.use(initReactI18next);

    const loader = options.loader;
    if (typeof loader === "function") {
        const backend = createBackend({
                translation: loader,
                [CELERA_NAMESPACE]: loadCeleraTranslations
            }, defaultLocale);
        instance = instance.use(backend);
        await instance.init();
        return;
    }

    const backend = createBackend({
        ...loader,
        [CELERA_NAMESPACE]: loadCeleraTranslations
    }, defaultLocale);
    instance = instance.use(backend);
    await instance.init({
        // make sure the namespaces are registered, so translations work
        // in contexts without react-i18next
        ns: Object.keys(loader),
    });
};

const loadCeleraTranslations = async (
    language: string,
): Promise<Record<string, string>> => {
    const SupportedLocales = [
        "de-DE",
        "en-US",
        "es-ES",
        "fr-FR",
        "it-IT",
        "ja-JP",
        "ko-KR",
        "nl-NL",
        "ru-RU",
        "zh-CN",
        "zh-TW",
    ] as const;
    const langToLoad = convertToSupportedLocaleIn(language, SupportedLocales) || "en-US";
    return Strings[langToLoad];
};
