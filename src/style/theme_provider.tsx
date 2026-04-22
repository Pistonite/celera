import type { PropsWithChildren } from "react";
import { FluentProvider, webDarkTheme, webLightTheme } from "@fluentui/react-components";

import { useDark } from "self::pref";

/**
 * React component to provide Fluent UI theme to the app
 *
 * @class
 */
export const ThemeProvider: React.FC<PropsWithChildren> = (props) => {
    const { children } = props;
    const dark = useDark();
    const theme = dark ? webDarkTheme : webLightTheme;
    return <FluentProvider theme={theme}>{children}</FluentProvider>;
};
