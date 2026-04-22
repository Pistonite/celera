import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItemRadio,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Tooltip,
} from "@fluentui/react-components";
import { Globe20Regular } from "@fluentui/react-icons";
import {
    CELERA_NAMESPACE,
    getLocalizedLanguageName,
    getSupportedLocales,
    setLocale,
    useLocale,
    useTranslation,
} from "self::i18n";

import type { CommonProps } from "self::util";

/**
 * React component for a language picker button or menu
 *
 * @class
 */
export const LanguagePicker: React.FC<CommonProps> = (props) => {
    const { as = "button" } = props;
    const locale = useLocale();
    const t = useTranslation(CELERA_NAMESPACE);
    return (
        <Menu
            checkedValues={{ locale: [locale] }}
            onCheckedValueChange={async (_, { checkedItems }) => {
                setLocale(checkedItems[0]);
            }}
        >
            <MenuTrigger disableButtonEnhancement>
                {as === "button" ? (
                    <Tooltip relationship="label" content={t("menu.language")}>
                        <MenuButton appearance="subtle" icon={<Globe20Regular />} />
                    </Tooltip>
                ) : as === "menu" ? (
                    <MenuButton appearance="subtle" icon={<Globe20Regular />}>
                        {t("menu.language")}
                    </MenuButton>
                ) : (
                    <MenuItem icon={<Globe20Regular />}>{t("menu.language")}</MenuItem>
                )}
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    {getSupportedLocales().map((lang) => (
                        <MenuItemRadio key={lang} name="locale" value={lang}>
                            {getLocalizedLanguageName(lang)}
                        </MenuItemRadio>
                    ))}
                </MenuList>
            </MenuPopover>
        </Menu>
    );
};
