import i18next, { t } from "i18next";
import type { LanguageDetectorModule } from "i18next";

import { getLocale, setLocale } from "./state.ts";

export { useTranslation } from "react-i18next";
export { i18next, t as translate };

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
