import { logger } from "@pistonite/pure/log";

export const log = logger("celera", { })

export type CommonProps = {
    /** Where the control will be. Default is "button" */
    as?: "button" | "menu" | "submenu";
};
