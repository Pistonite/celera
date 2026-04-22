import { logger } from "@pistonite/pure/log";

/** The logger. Can be used to modify log levels for Celera */
export const log = logger("celera", {});

export interface CommonProps {
    /** Where the control will be. Default is "button" */
    as?: "button" | "menu" | "submenu";
}
