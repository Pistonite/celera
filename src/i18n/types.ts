
/**
 * Type alias for a function that loads language files
 *
 * The language loader can either throw or return `undefined` if the language fails to load
 */
export type LoadLanguageFn = (language: string) => Promise<Record<string, string> | undefined>;

/**
 * Option for initializing locale with i18next integration
 */
export interface LocaleOptions<TLocale extends string> {
    /**
     * List of supported locale or languages.
     * These can be full locale strings like "en-US" or just languages like "en"
     */
    supported: readonly TLocale[];

    /**
     * The default locale if the user's preferred locale is not supported.
     * This must be one of the items in `supported`.
     */
    default: TLocale;

    /**
     * Initial value for locale
     *
     * If not set, it will default to calling `getPreferredLocale()`,
     * which is based on the browser's language settings.
     *
     * If `persist` is `true`, it will also check the value from localStorage
     *
     * If the initial value is not supported, it will default to the default locale
     */
    initial?: TLocale;

    /**
     * Persist the locale preference to localStorage
     */
    persist?: boolean;

    /**
     * Hook to be called by `setLocale`, but before setting the locale and thus notifying
     * the subscribers.
     *
     * Internally, this is synchronized by the `serial` function, which means
     * if another `setLocale` is called before the hook finishes, the set operation of the current
     * call will not happen and the locale will only be set after the hook finishes in the new call.
     *
     * If there are race conditions in the hook, `checkCancel` should be used after any async operations,
     * which will throw an error if another call happened.
     *
     * Note that this hook will not be called during initialization.
     */
    onBeforeChange?: (newLocale: string, checkCancel: () => void) => void | Promise<void>;

    /**
     * The sync mode between i18next and celera. Default is "full"
     *
     * With "full", either `setLocale` or `i18next.changeLanguage` will sync the other.
     * For other modes, changing the first in the mode name (i18next or celera) will sync to the second, but not the other way around.
     *
     * "full" or "i18next-celera" will also sync the initially detected language from pure to i18next
     */
    sync?: "full" | "i18next-celera" | "celera-i18next";

    /**
     * The language loader function(s).
     *
     * If a function is provided, it will be called for the "translations" namespace.
     * Otherwise, you can provide a record of functions for each namespace.
     */
    loader: LoadLanguageFn | Record<string, LoadLanguageFn>;
};
