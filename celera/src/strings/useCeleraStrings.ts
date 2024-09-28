import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { CeleraStringKey, CeleraStrings, STRINGS } from "./strings.ts";

export const useCeleraTranslations = (): ((key: CeleraStringKey) => string) => {
    const { t } = useTranslation("celera");
    return useCallback(
        (key: CeleraStringKey) => {
            const value = t(key);
            if (!value || value === key) {
                return STRINGS.en[key as keyof CeleraStrings];
            }
            return value;
        },
        [t],
    );
};
