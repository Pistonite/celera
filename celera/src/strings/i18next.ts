import type { BackendModule } from "i18next";
import { STRINGS } from "./strings.ts";

export const I18nCeleraBackend: BackendModule = {
    type: "backend",
    init: () => {},
    read: async (language: string, namespace: string) => {
        if (namespace !== "celera") {
            return undefined;
        }

        if (language in STRINGS) {
            return STRINGS[language];
        }

        const keys = Object.keys(STRINGS);
        language = language.split("-", 2)[0];
        const keyLength = keys.length;
        for (let i = 0; i < keyLength; i++) {
            const key = keys[i];
            if (key.startsWith(language)) {
                return STRINGS[key];
            }
        }

        return STRINGS.en;
    },
};
