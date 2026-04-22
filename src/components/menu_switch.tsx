import { forwardRef, type PropsWithChildren } from "react";
import {
    makeStyles,
    MenuItem,
    type MenuItemProps,
    Switch,
    type SwitchOnChangeData,
    type SwitchProps,
} from "@fluentui/react-components";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "row",
        gap: "8px",
        height: "20px",
        alignItems: "center",
    },
    label: {
        flexGrow: 1,
    },
});

/**
 * React component. A menu item with a label and a switch
 *
 * This is a Wrapper around FUI MenuItem and Switch to display controlled switch menu item
 * because the FUI MenuItemSwitch cannot be controlled individually from the menu
 *
 * For now the label needs to be passed in as children
 *
 * ```typescript
 * <MenuSwitch checked={..}, onChange={..}>
 *    label
 * </MenuSwitch>
 * ```
 *
 * See [Fluent UI Docs for Switch](https://storybooks.fluentui.dev/react/?path=/docs/components-switch--docs) and [Fluent UI Docs for MenuItem](https://storybooks.fluentui.dev/react/?path=/docs/components-menu-menu--docs)
 *
 * @interface
 */
export type MenuSwitchProps = {
    onChange: (
        e: React.MouseEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>,
        data: SwitchOnChangeData,
    ) => void;
} & Omit<SwitchProps, "onChange" | "children"> &
    Omit<MenuItemProps, "onClick" | "onChange" | "children">;

/**
 * React component. A menu item with a label adn a switch. See {@link MenuSwitchProps}
 *
 * @class
 */
export const MenuSwitch = forwardRef<HTMLDivElement, PropsWithChildren<MenuSwitchProps>>(
    ({ label: _unused, checked, onChange, children, ...props }, ref) => {
        const styles = useStyles();
        return (
            <MenuItem
                ref={ref}
                persistOnClick
                onClick={(e) => {
                    onChange?.(e, { checked: !checked });
                }}
                {...props}
            >
                <span className={styles.container}>
                    <span className={styles.label}>{children}</span>
                    <Switch {...props} checked={checked} onChange={onChange} />
                </span>
            </MenuItem>
        );
    },
);
MenuSwitch.displayName = "MenuSwitch";
