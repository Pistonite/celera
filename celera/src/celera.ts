import { create } from "zustand";

import type {
    CeleraInstance,
    CeleraOptions,
    CeleraState,
    Dimension,
    Layout,
    LayoutMap,
    Scene,
    SceneMap,
    SplitDirection,
    WidgetMap,
    WidgetRestriction,
} from "./types.ts";

export type UseCelera<TScenes extends string, TWidget> = ReturnType<
    ReturnType<typeof create<CeleraInstance<TScenes, TWidget>>>
>;

const CELERA_KEY = "Celera";

export const initializeCelera = <TScenes extends string, TWidget, TData>(
    o: CeleraOptions<TScenes, TWidget, TData>,
): UseCelera<TScenes, TWidget> => {
    // const options = {
    //     xSize: o.xSize,
    //     ySize: o.ySize,
    // };
    //
    const xSize = o.xSize;
    const ySize = o.ySize;
    const persist = !!o.persist;

    let data: Record<string, unknown> = {};
    if (persist) {
        const rawData = localStorage.getItem(CELERA_KEY);
        if (rawData) {
            try {
                const parsed: unknown = JSON.parse(rawData);
                if (parsed && typeof parsed === "object") {
                    data = parsed as Record<string, unknown>;
                }
            } catch {
                /* ignore */
            }
        }
    }
    // deserialize widgets
    let widgets: WidgetMap<TWidget> = {};
    const deserializeWidget =
        o.deserializeWidget || ((data) => data as TWidget);
    if ("widgets" in data) {
        const rawWidgets = data.widgets;
        if (rawWidgets && typeof rawWidgets === "object") {
            for (const key in rawWidgets) {
                const w = deserializeWidget(
                    key,
                    rawWidgets[key as keyof typeof rawWidgets],
                );
                if (w !== undefined) {
                    widgets[key] = w;
                }
            }
        }
    }
    widgets = o.initializeWidgets(widgets);
    // deserialze layouts
    let layouts: LayoutMap = {};
    if ("layouts" in data) {
        const rawLayouts = data.layouts;
        if (rawLayouts && typeof rawLayouts === "object") {
            for (const key in rawLayouts) {
                const layout = (rawLayouts as Record<string, unknown>)[key];
                if (!Array.isArray(layout)) {
                    continue;
                }
                const len = layout.length;
                const newLayout: Layout = [];
                for (let i = 0; i < len; i++) {
                    const wi: unknown = layout[i];
                    if (!wi || typeof wi !== "object") {
                        continue;
                    }
                    if (!("widget" in wi) || !("dim" in wi)) {
                        continue;
                    }
                    const widget = wi.widget as string;
                    if (!widgets[widget]) {
                        continue;
                    }
                    const dim = wi.dim;
                    if (!dim || typeof dim !== "object") {
                        continue;
                    }
                    if (
                        !("x" in dim) ||
                        !("y" in dim) ||
                        !("w" in dim) ||
                        !("h" in dim)
                    ) {
                        continue;
                    }
                    const { x, y, w, h } = dim;
                    if (
                        !Number.isInteger(x) ||
                        !Number.isInteger(y) ||
                        !Number.isInteger(w) ||
                        !Number.isInteger(h)
                    ) {
                        continue;
                    }
                    if ((w as number) <= 0 || (h as number) <= 0) {
                        continue;
                    }
                    newLayout.push({
                        widget,
                        dim: {
                            x: x as number,
                            y: y as number,
                            w: w as number,
                            h: h as number,
                        },
                    });
                }
                layouts[key] = newLayout;
            }
        }
    }
    layouts = o.initializeLayouts(layouts);

    // deserialize scenes
    let scenes: Partial<SceneMap<TScenes>> = {};
    if ("scenes" in data) {
        const rawScenes = data.scenes;
        if (rawScenes && typeof rawScenes === "object") {
            for (const key in rawScenes) {
                if (!o.sceneKeys.includes(key as TScenes)) {
                    continue;
                }
                const scene = (rawScenes as Record<string, unknown>)[key];
                if (!scene || typeof scene !== "object") {
                    continue;
                }
                const newLayouts = [];
                if ("layouts" in scene && Array.isArray(scene.layouts)) {
                    const len = scene.layouts.length;
                    for (let i = 0; i < len; i++) {
                        const layoutKey: unknown = scene.layouts[i];
                        if (
                            layoutKey &&
                            typeof layoutKey === "string" &&
                            layoutKey in layouts
                        ) {
                            newLayouts.push(layoutKey);
                        }
                    }
                }
                let currentLayout = "";
                if (
                    "currentLayout" in scene &&
                    typeof scene.currentLayout === "string" &&
                    scene.currentLayout in layouts
                ) {
                    currentLayout = scene.currentLayout;
                }
                const widgetRestriction: WidgetRestriction = {
                    required: [],
                    disallowed: [],
                };
                if ("widgets" in scene) {
                    const rawWR = scene.widgets;
                    if (rawWR && typeof rawWR === "object") {
                        if (
                            "required" in rawWR &&
                            Array.isArray(rawWR.required)
                        ) {
                            widgetRestriction.required = rawWR.required
                                .filter(Boolean)
                                .map(String);
                        }
                        if (
                            "disallowed" in rawWR &&
                            Array.isArray(rawWR.disallowed)
                        ) {
                            widgetRestriction.disallowed = rawWR.disallowed
                                .filter(Boolean)
                                .map(String);
                        }
                    }
                }
                const newScene: Scene = {
                    layouts: newLayouts,
                    currentLayout,
                };
                if (
                    (widgetRestriction.required?.length || 0) > 0 ||
                    (widgetRestriction.disallowed?.length || 0) > 0
                ) {
                    newScene.widgets = widgetRestriction;
                }
                scenes[key as TScenes] = newScene;
            }
        }
    }
    const initedScenes = o.initializeScenes(scenes);

    const colorScheme = o.colorScheme || "light";

    const useCelera = create<CeleraInstance<TScenes, TWidget>>()((set) => ({
        xSize,
        ySize,
        persist,
        colorScheme,
        setColorScheme: (colorScheme) => {
            set({ colorScheme });
        },

        layoutSerial: 0,
        error: "",
        currentScene: o.initialScene,
        widgets,
        layouts,
        scenes: initedScenes,
        editing: false,
        localizeWidget: o.localizeWidget || ((_s, _l, w) => w),

        setWidget: (key, data) => {
            set((state) => {
                return {
                    widgets: {
                        ...state.widgets,
                        [key]: data,
                    },
                };
            });
        },

        deleteWidget: (key) => {
            set((state) => {
                if (!(key in state.widgets)) {
                    return {};
                }
                if (!canDeleteWidget(state, key)) {
                    return {};
                }
                const { [key]: _, ...rest } = state.widgets;
                return {
                    widgets: rest,
                    layouts: removeWidgetReference(state.layouts, key),
                };
            });
        },

        setLayout: (key, layout) => {
            set((state) => {
                const newLayout = fitLayout(layout, state.xSize, state.ySize);
                const newLayoutLen = newLayout.length;
                for (let i = 0; i < newLayoutLen; i++) {
                    const { widget, dim } = newLayout[i];
                    if (dim.w <= 0 || dim.h <= 0) {
                        console.log(state.layouts[key]);
                        if (
                            !canRemoveWidgetFromLayout(
                                state.scenes,
                                state.layouts[key],
                                key,
                                widget,
                            )
                        ) {
                            return {
                                layoutSerial: state.layoutSerial + 1,
                                error: "tooltipCannotChange",
                            };
                        }
                    }
                }
                return {
                    layouts: {
                        ...state.layouts,
                        [key]: newLayout,
                    },
                };
            });
        },

        forceRerender: () => {
            set((state) => {
                return {
                    layoutSerial: state.layoutSerial + 1,
                };
            });
        },

        removeWidgetFromLayout: (layoutKey, idx) => {
            set((state) => {
                const widgetInstance = state.layouts[layoutKey]?.[idx];
                if (!widgetInstance) {
                    return {};
                }
                if (
                    !canRemoveWidgetFromLayout(
                        state.scenes,
                        state.layouts[layoutKey],
                        layoutKey,
                        widgetInstance.widget,
                    )
                ) {
                    return {};
                }
                const newLayout = state.layouts[layoutKey].filter(
                    (_, i) => i !== idx,
                );
                return {
                    layouts: {
                        ...state.layouts,
                        [layoutKey]: newLayout,
                    },
                };
            });
        },

        splitWidgetInLayout: (layoutKey, idx, direction) => {
            set((state) => {
                const widgetInstance = state.layouts[layoutKey]?.[idx];
                if (!widgetInstance) {
                    return {};
                }
                if (!canSplitDim(widgetInstance.dim, direction)) {
                    return {};
                }
                const [oldDim, newDim] = splitDim(
                    widgetInstance.dim,
                    direction,
                );
                const newLayout = [...state.layouts[layoutKey]];
                newLayout[idx] = {
                    ...widgetInstance,
                    dim: oldDim,
                };
                newLayout.push({
                    widget: "",
                    dim: newDim,
                });
                return {
                    layouts: {
                        ...state.layouts,
                        [layoutKey]: newLayout,
                    },
                };
            });
        },

        switchWidgetInLayout: (layoutKey, idx, newKey) => {
            set((state) => {
                const widgetInstance = state.layouts[layoutKey]?.[idx];
                if (!widgetInstance) {
                    return {};
                }
                if (
                    !canRemoveWidgetFromLayout(
                        state.scenes,
                        state.layouts[layoutKey],
                        layoutKey,
                        widgetInstance.widget,
                    )
                ) {
                    return {};
                }
                const newLayout = [...state.layouts[layoutKey]];
                newLayout[idx] = {
                    ...widgetInstance,
                    widget: newKey,
                };
                return {
                    layouts: {
                        ...state.layouts,
                        [layoutKey]: newLayout,
                    },
                };
            });
        },

        deleteLayout: (key) => {
            set((state) => {
                if (!(key in state.layouts)) {
                    return {};
                }
                const { [key]: _, ...rest } = state.layouts;
                return {
                    layouts: rest,
                    scenes: removeLayoutReference(state.scenes, key),
                };
            });
        },

        switchLayout: (scene, layoutKey) => {
            set((state) => {
                if (!state.scenes[scene].layouts.includes(layoutKey)) {
                    return {};
                }
                return {
                    scenes: {
                        ...state.scenes,
                        [scene]: {
                            ...state.scenes[scene],
                            currentLayout: layoutKey,
                        },
                    },
                };
            });
        },

        switchScene: (key) => {
            set((state) => {
                if (!(key in state.scenes)) {
                    return {};
                }
                return {
                    currentScene: key,
                };
            });
        },

        startEditing: () => {
            set({ editing: true });
        },

        finishEditing: () => {
            set((state) => {
                return {
                    ...fixupLayouts(state),
                    editing: false,
                };
            });
        },

        setError: (error) => {
            set({ error });
        },
    }));

    // TODO: persist

    return useCelera;
};

// export const canSetWidget = <TScenes extends string, TWidget>(state: CeleraState<TScenes, TWidget>, key: string) => {
//     const currentScene = state.scenes[state.currentScene];
//     return currentScene.widgets?.disallowed?.includes(key) ?? true;
// };

export const getAvailableWidgetsForLayout = <TScenes extends string, TWidget>(
    scenes: SceneMap<TScenes>,
    widgets: WidgetMap<TWidget>,
    layoutKey: string,
): string[] => {
    const referencedScenes = getScenesFromLayout(layoutKey, scenes);
    const scenesLen = referencedScenes.length;

    const available = Object.keys(widgets).filter((widgetKey) => {
        for (let i = 0; i < scenesLen; i++) {
            if (
                scenes[referencedScenes[i]].widgets?.disallowed?.includes(
                    widgetKey,
                )
            ) {
                return false;
            }
        }
        return true;
    });
    available.sort();
    return available;
};

export const canDeleteWidget = <TScenes extends string, TWidget>(
    state: CeleraState<TScenes, TWidget>,
    key: string,
) => {
    for (const sceneKey in state.scenes) {
        // if this widget is required by any scene, then its definition cannot be removed
        if (state.scenes[sceneKey].widgets?.required?.includes(key)) {
            return false;
        }
    }
    return true;
};

export const canAddWidgetToLayout = <TScenes extends string, TWidget>(
    state: CeleraState<TScenes, TWidget>,
    layoutKey: string,
    widgetKey: string,
) => {
    // a widget can be added to a layout if the layout does not belong
    // to a scene that disallows the widget
    const scenes = getScenesFromLayout(layoutKey, state.scenes);
    const scenesLen = scenes.length;
    for (let i = 0; i < scenesLen; i++) {
        if (state.scenes[scenes[i]].widgets?.disallowed?.includes(widgetKey)) {
            return false;
        }
    }
    return true;
};

export const canRemoveWidgetFromLayout = <TScenes extends string>(
    scenes: SceneMap<TScenes>,
    layout: Layout,
    layoutKey: string,
    widgetKey: string,
) => {
    // if the widget is not the only widget of this key in the layout, then it can be removed
    let found = false;
    let layoutLen = layout.length;
    for (let i = 0; i < layoutLen; i++) {
        if (layout[i].widget === widgetKey) {
            if (found) {
                return true;
            }
            found = true;
        }
    }
    const referencedScenes = getScenesFromLayout(layoutKey, scenes);
    const scenesLen = referencedScenes.length;
    for (let i = 0; i < scenesLen; i++) {
        if (
            scenes[referencedScenes[i]].widgets?.required?.includes(widgetKey)
        ) {
            return false;
        }
    }
    return true;
};

const getScenesFromLayout = <TScenes extends string>(
    layoutKey: string,
    scenes: SceneMap<TScenes>,
): TScenes[] => {
    const sceneKeys: TScenes[] = [];
    for (const sceneKey in scenes) {
        if (scenes[sceneKey].layouts.includes(layoutKey)) {
            sceneKeys.push(sceneKey);
        }
    }
    return sceneKeys;
};

const removeWidgetReference = (layouts: LayoutMap, key: string) => {
    let changed = false;
    const changes: LayoutMap = {};
    for (const layoutKey in layouts) {
        const newLayout = removeWidgetReferenceInLayout(
            layouts[layoutKey],
            key,
        );
        if (newLayout !== layouts[layoutKey]) {
            changes[layoutKey] = newLayout;
            changed = true;
        }
    }
    if (!changed) {
        return layouts;
    }
    return {
        ...layouts,
        ...changes,
    };
};

const removeWidgetReferenceInLayout = (layout: Layout, key: string): Layout => {
    const newLayout = layout.filter(({ widget }) => widget !== key);
    if (newLayout.length === layout.length) {
        return layout;
    }
    return newLayout;
};

const removeLayoutReference = <TScenes extends string>(
    scenes: SceneMap<TScenes>,
    key: string,
): SceneMap<TScenes> => {
    let changed = false;
    const changes: SceneMap<TScenes> = {} as SceneMap<TScenes>;
    for (const sceneKey in scenes) {
        const newScene = removeLayoutReferenceInScene(scenes[sceneKey], key);
        if (newScene !== scenes[sceneKey]) {
            changes[sceneKey] = newScene;
            changed = true;
        }
    }
    if (!changed) {
        return scenes;
    }
    return {
        ...scenes,
        ...changes,
    };
};

const removeLayoutReferenceInScene = (
    scene: Scene,
    layoutKey: string,
): Scene => {
    const newLayouts = scene.layouts.filter((key) => key !== layoutKey);
    if (newLayouts.length === scene.layouts.length) {
        return scene;
    }
    return {
        ...scene,
        layouts: newLayouts,
    };
};

const fixupLayouts = <TScenes extends string, TWidget>(
    state: CeleraState<TScenes, TWidget>,
): CeleraState<TScenes, TWidget> => {
    const newMap: LayoutMap = {};
    for (const layoutKey in state.layouts) {
        const availableWidgets = getAvailableWidgetsForLayout(
            state.scenes,
            state.widgets,
            layoutKey,
        );
        const newLayout = state.layouts[layoutKey].filter((layout) => {
            return (
                layout.widget &&
                availableWidgets.includes(layout.widget) &&
                isDimVisible(layout.dim, state.xSize, state.ySize)
            );
        });
        newMap[layoutKey] = newLayout;
    }
    return {
        ...state,
        layouts: newMap,
    };
};

const isDimVisible = (dim: Dimension, xSize: number, ySize: number) => {
    const { w, h } = fitLayoutDim(dim, xSize, ySize);
    return w > 0 && h > 0;
};

const fitLayout = (layout: Layout, xSize: number, ySize: number): Layout => {
    return layout.map(({ dim, widget }) => {
        return { dim: fitLayoutDim(dim, xSize, ySize), widget };
    });
};

const fitLayoutDim = (
    { x, y, w, h }: Dimension,
    xSize: number,
    ySize: number,
) => {
    // Make sure the top of always visible
    if (y < 0) {
        y = 0;
    }
    // Make sure the bottom is always visible
    if (y >= ySize) {
        y = ySize;
    }
    if (y + h > ySize) {
        h = ySize - y;
    }
    // Make sure the left is always visible
    if (x < 0) {
        x = 0;
    }
    if (x >= xSize) {
        x = xSize;
    }
    // Make sure the right is always visible
    if (x + w > xSize) {
        w = xSize - x;
    }
    // If the widget has 0 width or height, try to make it visible
    if (w <= 0 && x < xSize) {
        w = xSize - x;
    }
    // If the widget has 0 width or height, try to make it visible
    if (h <= 0 && y < ySize) {
        h = xSize - h;
    }
    return { x, y, w, h };
};

export const canSplitDim = ({ w, h }: Dimension, direction: SplitDirection) => {
    if (direction === "horizontal") {
        return w > 1;
    }
    return h > 1;
};

const splitDim = (
    { x, y, w, h }: Dimension,
    direction: SplitDirection,
): [Dimension, Dimension] => {
    const splitLeftRight = direction === "horizontal";
    const newW = splitLeftRight ? Math.floor(w / 2) : w;
    const newH = splitLeftRight ? h : Math.floor(h / 2);
    return [
        {
            x,
            y,
            w: newW,
            h: newH,
        },
        {
            x: splitLeftRight ? x + newW : x,
            y: splitLeftRight ? y : y + newH,
            w: splitLeftRight ? w - newW : w,
            h: splitLeftRight ? h : h - newH,
        },
    ];
};
