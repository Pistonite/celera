import { CeleraStringKey } from "./strings/strings";

export type CeleraOptions<TScenes extends string, TWidget, TData> = {
    sceneKeys: readonly TScenes[];
    /** Size of the grid in the X (horizontal) direction */
    xSize: number;
    /** Size of the grid in the Y (vertical) direction */
    ySize: number;
    /** Automatically persist celera widgets/layouts into localStorage */
    persist?: boolean;

    /**
     * Function to localize the name of a widget
     *
     * If not provided, the default behavior is to use the widget key as the name
     */
    localizeWidget?: WidgetNameLocalizeFn<TWidget>;

    /**
     * Convert widget runtime object to data object before persisting,
     * to strip out non-serializable properties like functions
     *
     * Default is to return the widget object as-is
     */
    serializeWidget?: (key: string, widget: TWidget) => TData;
    /**
     * Convert widget data object to runtime object after loading
     * to hydrate the widget with any necessary runtime properties like functions.
     *
     * If the widget cannot be deserialized, return undefined.
     *
     * Default is to return the data object as-is
     */
    deserializeWidget?: (key: string, data: unknown) => TWidget | undefined;

    /**
     * Initialize the widgets after loading.
     *
     * This is where you may create default widgets, if they don't already exist.
     * The passed-in map can be mutated/returned, or a new map can be returned.
     *
     * If no persisted data exists, empty map is passed in.
     */
    initializeWidgets: (widgets: WidgetMap<TWidget>) => WidgetMap<TWidget>;

    /**
     * Initialize the layouts after loading.
     *
     * This is where you can create default layouts if they don't already exist.
     *
     * Some clean ups are automatically done before calling this function:
     * - Widgets that are not in the widget map are removed
     * - Widgets that have 0 width or height are removed
     * - Layout with no widgets are removed
     * - Illegal layouts are removed - if the layout is in a scene and doesn't satisfy the widget restrictions
     *
     * If no persisted data exists, empty map is passed in.
     */
    initializeLayouts: (layouts: LayoutMap) => LayoutMap;

    initialScene: TScenes;

    initializeScenes: (scenes: Partial<SceneMap<TScenes>>) => SceneMap<TScenes>;

    colorScheme?: CeleraColorSceme;
};

export type CeleraPersistentData<TScenes extends string, TData> = {
    widgets: WidgetMap<TData>;
    layouts: LayoutMap;
    scenes: SceneMap<TScenes>;
};

export type CeleraState<TScenes extends string, TWidget> = {
    xSize: number;
    ySize: number;
    persist: boolean;
    scenes: SceneMap<TScenes>;
    layouts: LayoutMap;
    widgets: WidgetMap<TWidget>;
    currentScene: TScenes;
    editing: boolean;
    colorScheme: CeleraColorSceme;
    layoutSerial: number;
    error: CeleraStringKey | "";
    localizeWidget: WidgetNameLocalizeFn<TWidget>;
};

export type CeleraColorSceme = "light" | "dark";

export type CeleraAction<TScenes extends string, TWidget> = {
    setColorScheme: (colorScheme: CeleraColorSceme) => void;
    /** Add or edit the widget with a key */
    setWidget: (key: string, data: TWidget) => void;
    /** Delete the widget with a key */
    deleteWidget: (key: string) => void;
    /** Set the layout for a layout key */
    setLayout: (key: string, layout: Layout) => void;
    /** Remove the widget at index from the layout */
    removeWidgetFromLayout: (layoutKey: string, idx: number) => void;
    /** Split the widget at index in the layout to a new widget */
    splitWidgetInLayout: (
        layoutKey: string,
        idx: number,
        direction: SplitDirection,
    ) => void;
    /** Switch the widget at index in the layout to a different widget */
    switchWidgetInLayout: (
        layoutKey: string,
        idx: number,
        newKey: string,
    ) => void;
    /** Remove the layout with a key */
    deleteLayout: (key: string) => void;
    /** Switch to a different layout in the scene */
    switchLayout: (scene: TScenes, layoutKey: string) => void;
    /** Switch to a different scene */
    switchScene: (key: TScenes) => void;
    startEditing: () => void;
    finishEditing: () => void;
    forceRerender: () => void;
    setError: (error: CeleraStringKey | "") => void;
};

export type SplitDirection = "vertical" | "horizontal";

export type CeleraInstance<TScenes extends string, TWidget> = CeleraState<
    TScenes,
    TWidget
> &
    CeleraAction<TScenes, TWidget>;

/**
 * A scene is a collection of layouts, with one layout being the current layout
 *
 * Scenes are defined during initialization and cannot be changed afterwards
 */
export type Scene = {
    /** The layouts in the scene */
    layouts: string[];
    /** The current layout */
    currentLayout: string;
    /** Widget restrictions for the scene */
    widgets?: WidgetRestriction;
};

/** Widget restriction for scenes */
export type WidgetRestriction = {
    /**
     * If a widget is required, the last widget in a layout in the scene
     * cannot be changed to another layout or removed
     *
     * Note that this does not guarantee that the widget will be in the layout.
     */
    required?: string[];
    /**
     * If a widget is disallowed, the widget cannot be added to any layout in the scene,
     * and will be removed upon loading the scene from persisted data
     */
    disallowed?: string[];
};

export type SceneMap<TScenes extends string> = {
    [key in TScenes]: Scene;
};

/**
 * Function to get the localized name for a widget
 *
 * Localized names are displayed in the Widget title component when editing the layout
 */
export type WidgetNameLocalizeFn<TWidget> = (
    scene: string,
    layout: string,
    widget: string,
    data: TWidget,
) => string;

export type Layout = WidgetInstance[];

/**
 * Map of layout keys to layout data
 */
export type LayoutMap = {
    [key: string]: Layout;
};

/**
 * A widget instance is a widget key and its dimensions in the layout
 */
export type WidgetInstance = {
    widget: string;
    dim: Dimension;
};

/**
 * A map from widget key to widget data
 * of type T
 */
export type WidgetMap<T> = {
    [key: string]: T;
};

export type Dimension = {
    x: number;
    y: number;
    w: number;
    h: number;
};
