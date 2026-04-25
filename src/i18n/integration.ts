import i18next_, { t } from "i18next";
import type { LanguageDetectorModule } from "i18next";
import { useTranslation as useTranslation_ } from "react-i18next";

import { getLocale, setLocale } from "./state.ts";
import type { TranslatorFn } from "./types.ts";

/**
 * React hook to get translation function for a namespace
 *
 * This wraps `useTranslation` from `react-i18next`.
 */
export const useTranslation = (
    namespace?: string,
    options?: UseTranslationOptions,
): TranslatorFn => {
    const { t } = useTranslation_(namespace, options);
    return t;
};

/** Partial options for `useTranslation` from `react-i18next` */
export interface UseTranslationOptions {
    nsMode?: "fallback" | "default";
}

/** The i18next instance */
export const i18next = i18next_;
/**
 * The i18next.t translation function
 * @function
 */
export const translate: TranslatorFn = t;

/**
 * Language detector plugin for i18next
 */
export const syncI18nextToCeleraModule: LanguageDetectorModule = {
    type: "languageDetector" as const,
    detect: getLocale,
    cacheUserLanguage: (language: string): void => {
        setLocale(language);
    },
};
