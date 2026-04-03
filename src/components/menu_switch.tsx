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

export type MenuSwitchProps = {
    onChange: (
        e: React.MouseEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>,
        data: SwitchOnChangeData,
    ) => void;
} & Omit<SwitchProps, "onChange" | "children"> &
    Omit<MenuItemProps, "onClick" | "onChange" | "children">;

/**
 * Wrapper around FUI MenuItem and Switch to display controlled switch menu item
 * because the FUI MenuItemSwitch cannot be controlled individually from the menu
 *
 * For now the label needs to be passed in as children
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
