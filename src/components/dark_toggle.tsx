import { Button, Tooltip } from "@fluentui/react-components";
import { WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";

import { useDark, setDark } from "self::pref";
import { CELERA_NAMESPACE, useTranslation }
from "self::i18n";

import { MenuSwitch } from "./menu_switch.tsx";

export interface DarkToggleProps {
    as?: "button" | "submenu";
};

/**
 * Toggle the Pure dark mode system
 */
export const DarkToggle: React.FC<DarkToggleProps> = (props) => {
    const { as = "button" } = props;
    const dark = useDark();
    const { t } = useTranslation(CELERA_NAMESPACE);
    if (as === "button") {
        return (
            <Tooltip relationship="label" content={t("menu.dark")}>
                <Button
                    appearance="subtle"
                    icon={dark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
                    onClick={() => setDark(!dark)}
                />
            </Tooltip>
        );
    }
    return (
        <MenuSwitch checked={dark} onChange={() => setDark(!dark)} icon={<WeatherMoon20Regular />}>
            {t("menu.dark")}
        </MenuSwitch>
    );
};
