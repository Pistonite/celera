/**
 * Use browser API to guess user's preferred locale
 */
export const getPreferredLocale = (): string => {
    if (globalThis.Intl) {
        try {
            return globalThis.Intl.NumberFormat().resolvedOptions().locale;
        } catch {
            // ignore
        }
    }
    if (globalThis.navigator?.languages) {
        return globalThis.navigator.languages[0];
    }
    return "";
};

const localizedLanguageNames = new Map();

/**
 * Get the localized name of a language using `Intl.DisplayNames`.
 *
 * The results are interanlly cached, so you don't need to cache this yourself.
 */
export const getLocalizedLanguageName = (language: string): string => {
    if (language === "zh" || language === "zh-CN") {
        return "\u7b80\u4f53\u4e2d\u6587";
    }
    if (language === "zh-TW") {
        return "\u7e41\u9ad4\u4e2d\u6587";
    }
    if (localizedLanguageNames.has(language)) {
        return localizedLanguageNames.get(language);
    }
    const languageWithoutLocale = language.split("-")[0];
    const localized = new Intl.DisplayNames([language], {
        type: "language",
    }).of(languageWithoutLocale);
    localizedLanguageNames.set(language, localized);
    return localized || language;
};
