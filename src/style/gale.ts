import { type GriffelStyle, makeStyles, mergeClasses } from "@fluentui/react-components";

import { log } from "#util";

/**
 * Tailwind-like style engine, but uses `griffel`
 *
 * the benefit with griffel is we don't get duplicate CSS rules
 * from griffel and tailwind, and LTR/RTL works (which is one of the
 * main reasons we use griffel in the first place).
 *
 * There are 3 places to define styles in this architecture:
 * - Built-in style names - see {@link GALE_BUILTIN_STYLES}
 * - Project-level styles defined with `gale` function. For example:
 *     ```typescript
 *     import { gale } from "@pistonite/celera";
 *
 *     export const useStyleEngine = gale({
 *         "pad-s": {
 *             padding: 8
 *         }
 *     });
 *     ```
 *     These will be merged with the built-in styles (and could override them)
 * - Lastly, component-level styles defined with `useStyleEngine` exported from above.
 *   This is similar to `makeStyles` from `griffel`.
 *     ```typescript
 *     import { useStyleEngine } from "./path/to/my_style.ts";
 *
 *     const useStyles = useStyleEngine.extend({
 *         "my-container": {
 *             width: 500
 *         }
 *     });
 *     ```
 *
 * To use the style engine in a component, either invoke the project-level hook `useStyleEngine()`,
 * or the component-level hook `useStyles()`. **The style string passed to `m` is type-checked by TypeScript**
 * to be a space-separated list of style classes.
 *
 * ```typescript
 * import { makeStyles } from "@fluentui/react-components";
 *
 * export const MyComponent = () => {
 *     const m = useStyleEngine(); // project-level style idents
 *     return <div className={m("wh-100 padding-0")}>my component</div>;
 * };
 *
 * const useStyles = useStyleEngine.extend({
 *     container: {
 *         // not shown
 *     }
 * });
 *
 * export const MyComponent2 = () => {
 *     const m = useStyles(); // component-level style idents
 *     // note component-level styles are c- prefixed
 *     return <div className={m("h-100 c-my-container")}>my component</div>;
 * };
 *
 * const useExtraStyles = makeStyles({
 *     extra: {
 *         overflow: "hidden"
 *     }
 * });
 * ```
 *
 */
export const gale = <T extends string>(
    projectStyles: Record<T, GriffelStyle>,
): GaleEngine<GaleKeys<T>> => {
    // projectStyles -> componentStyles -> names
    const cache = new Map<
        Record<GaleKeys<T>, string>,
        Map<Record<string, string>, Map<string, string>>
    >();
    const useProjectLevelGriffelStyles = makeStyles({
        ...GALE_BUILTIN_STYLES,
        ...projectStyles,
    });
    const STUB_COMPONENT_STYLES_KEY = {}; // stable reference
    // this is the implementation when components call useStyleEngine or useStyles
    const useStyleEngine = (): GaleFn<GaleKeys<T>> => {
        // griffel makeStyles hook return cached stable reference
        const projectStyles = useProjectLevelGriffelStyles();
        let componentStylesToGaleStringCache = cache.get(projectStyles);
        if (!componentStylesToGaleStringCache) {
            const c = new Map();
            cache.set(projectStyles, c);
            componentStylesToGaleStringCache = c;
        }
        let galeStringCache = componentStylesToGaleStringCache.get(STUB_COMPONENT_STYLES_KEY);
        if (!galeStringCache) {
            const c = new Map();
            componentStylesToGaleStringCache.set(STUB_COMPONENT_STYLES_KEY, c);
            galeStringCache = c;
        }
        const mFunction = (...classes: string[]): string => {
            return computeClassesWithCache(
                projectStyles,
                STUB_COMPONENT_STYLES_KEY,
                galeStringCache,
                classes,
            );
        };
        return mFunction as GaleFn<GaleKeys<T>>;
    };
    const makeComponentLevelStyleEngine = <K extends string>(
        componentStyles: Record<K, GriffelStyle>,
    ): GaleHook<`c-${K}` | GaleKeys<T>> => {
        const mappedComponentStyles = Object.fromEntries(
            Object.entries(componentStyles).map(([k, v]) => ["c-" + k, v]),
        ) as Record<`c-${K}`, GriffelStyle>;
        const useComponentStyles = makeStyles(mappedComponentStyles);
        const useStyles = (): GaleFn<`c-${K}` | GaleKeys<T>> => {
            // griffel makeStyles hook return cached stable reference
            const projectStyles = useProjectLevelGriffelStyles();
            let componentStylesToGaleStringCache = cache.get(projectStyles);
            if (!componentStylesToGaleStringCache) {
                const c = new Map();
                cache.set(projectStyles, c);
                componentStylesToGaleStringCache = c;
            }
            const componentStyles = useComponentStyles();
            let galeStringCache = componentStylesToGaleStringCache.get(componentStyles);
            if (!galeStringCache) {
                const c = new Map();
                componentStylesToGaleStringCache.set(componentStyles, c);
                galeStringCache = c;
            }
            const mFunction = (...classes: string[]): string => {
                return computeClassesWithCache(
                    projectStyles,
                    componentStyles,
                    galeStringCache,
                    classes,
                );
            };
            return mFunction as GaleFn<`c-${K}` | GaleKeys<T>>;
        };
        return useStyles;
    };
    const computeClassesWithCache = (
        projectStyles: Record<string, string>,
        componentStyles: Record<string, string>,
        cache: Map<string, string>,
        classes: (string | undefined | null | false)[],
    ): string => {
        const classesConcatenated = classes.filter(Boolean).join(" ");
        const cached = cache.get(classesConcatenated);
        if (cached !== undefined) {
            return cached;
        }
        const parsed: string[] = [];
        for (const p of classesConcatenated.split(" ")) {
            const slotName = p.trim();
            if (!slotName) {
                continue;
            }
            // try component style first, fallback to project style
            const className: string | undefined =
                componentStyles[slotName] || projectStyles[slotName];
            if (!className) {
                log.error(`${slotName} not found in project or component styles`);
                continue;
            }
            parsed.push(className);
        }

        const result = mergeClasses(...parsed);
        cache.set(classesConcatenated, result);
        return result;
    };

    return Object.assign(useStyleEngine, { extend: makeComponentLevelStyleEngine });
};

/**
 * Engine function created by {@link gale}
 *
 * Can either be used as a hook to get the `m` function, or use `.extend()`
 * to extend the styles for component-specific hook.
 */
export interface GaleEngine<T extends string> extends GaleHook<T> {
    /** Extend the styles to get a component-specific hook */
    extend: <K extends string>(componentStyles: Record<K, GriffelStyle>) => GaleHook<`c-${K}` | T>;
}
/** Wrapper to concatenate built-in style keys with project-specific style keys */
export type GaleKeys<T extends string> = T | GaleBuiltinKey;
/** Hook to be called inside a component to get the `m` function. See {@link gale} */
export type GaleHook<T extends string> = () => GaleFn<T>;
/** The `m` function that turns a style string into class names */
export type GaleFn<T extends string> = <K extends string>(
    ...classes: (GaleString<K, T, []> | undefined | null | false)[]
) => string;

/** Type-safe, space-separated style idents */
export type GaleString<K extends string, T extends string, S extends string[]> = K extends S[number]
    ? { DuplicateStyleIdent: K }
    : K extends T
      ? K
      : K extends `${infer U} ${infer N}`
        ? U extends S[number]
            ? { DuplicateStyleIdent: U }
            : U extends T
              ? GaleString<N, T, [...S, U]> extends N
                  ? `${U} ${GaleString<N, T, [...S, U]>}`
                  : Prettify<ExtendAfter<GaleString<N, T, [...S, U]>, U>>
              : { InvalidStyleIdent: U }
        : { InvalidStyleIdent: K };
type ExtendAfter<T, U> = T extends { After: string } ? T : T & { After: U };
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

if (import.meta.vitest) {
    const { test, expectTypeOf } = import.meta.vitest;
    type Validate<K extends string> = GaleString<K, "foo" | "bar" | `long-${number}`, []>;
    test("GaleString", () => {
        expectTypeOf<Validate<"bar">>().toExtend<string>();
        expectTypeOf<Validate<"foo">>().toExtend<string>();
        expectTypeOf<Validate<"biz">>().toEqualTypeOf<{ InvalidStyleIdent: "biz" }>();

        expectTypeOf<Validate<"foo bar">>().toExtend<string>();
        expectTypeOf<Validate<"foo foo">>().toEqualTypeOf<{
            DuplicateStyleIdent: "foo";
            After: "foo";
        }>();
        expectTypeOf<Validate<"foo biz">>().toEqualTypeOf<{
            InvalidStyleIdent: "biz";
            After: "foo";
        }>();
        expectTypeOf<Validate<"biz foo">>().toEqualTypeOf<{ InvalidStyleIdent: "biz" }>();
        expectTypeOf<Validate<"foo bar biz">>().toEqualTypeOf<{
            InvalidStyleIdent: "biz";
            After: "bar";
        }>();
        expectTypeOf<Validate<"foo biz biz">>().toEqualTypeOf<{
            InvalidStyleIdent: "biz";
            After: "foo";
        }>();
        expectTypeOf<Validate<"foo biz bar">>().toEqualTypeOf<{
            InvalidStyleIdent: "biz";
            After: "foo";
        }>();
        expectTypeOf<Validate<"biz biz bar">>().toEqualTypeOf<{ InvalidStyleIdent: "biz" }>();
        expectTypeOf<Validate<"biz biz">>().toEqualTypeOf<{ InvalidStyleIdent: "biz" }>();
        expectTypeOf<
            Validate<"foo bar long-1 long-2 long-3 long-4 long-5 big long-6 long-7 long-8 long-9">
        >().toEqualTypeOf<{ InvalidStyleIdent: "big"; After: "long-5" }>();
    });
}

/** Built-in styles for {@link gale} */
export const GALE_BUILTIN_STYLES = {
    "wh-100v": {
        width: "100vw",
        height: "100vh",
    },
    "wh-100": {
        width: "100%",
        height: "100%",
    },
    "h-100": {
        height: "100%",
    },
    "w-100": {
        width: "100%",
    },
    flex: {
        display: "flex",
    },
    "flex-col": {
        display: "flex",
        flexDirection: "column",
    },
    "flex-row": {
        display: "flex",
        flexDirection: "row",
    },
    "flex-1": {
        flex: 1,
    },
    "flex-grow": {
        flexGrow: 1,
    },
    "flex-noshrink": {
        flexShrink: 0,
    },
    "flex-centera": {
        alignItems: "center",
    },
    "flex-centerj": {
        justifyContent: "center",
    },
    "flex-center": {
        alignItems: "center",
        justifyContent: "center",
    },
    "flex-end": {
        justifyContent: "flex-end",
    },
    "flex-wrap": {
        flexWrap: "wrap",
    },
    "scrollbar-thin": {
        scrollbarWidth: "thin",
    },
    "overflow-y-auto": {
        overflowY: "auto",
    },
    "overflow-x-auto": {
        overflowX: "auto",
    },
    "overflow-auto": {
        overflow: "auto",
    },
    "overflow-x-hidden": {
        overflowX: "hidden",
    },
    "overflow-y-hidden": {
        overflowY: "hidden",
    },
    "overflow-hidden": {
        overflow: "hidden",
    },
    "overflow-visible": {
        overflow: "visible",
    },
    "pos-rel": {
        position: "relative",
    },
    "pos-abs": {
        position: "absolute",
    },
    "all-sides-0": {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    "border-box": {
        boxSizing: "border-box",
    },
    "cursor-pointer": {
        cursor: "pointer",
    },
    "min-h-0": {
        minHeight: 0,
    },
    "min-w-0": {
        minWidth: 0,
    },
    "max-h-0": {
        maxHeight: 0,
    },
    "max-w-0": {
        maxWidth: 0,
    },
    "margin-0": {
        margin: 0,
    },
    "padding-0": {
        padding: 0,
    },
} as const satisfies Record<string, GriffelStyle>;

type GaleBuiltinKey = keyof typeof GALE_BUILTIN_STYLES;
