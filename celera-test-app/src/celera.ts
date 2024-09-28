import { initializeCelera, type SceneMap } from "@pistonite/celera";

const sceneKeys = ["main"] as const;
export type SceneKey = (typeof sceneKeys)[number];

const WidgetNames: Record<string, string> = {
    controller: "Controller",
    logo: "Logo",
    page: "Page Content",
    "page-list": "Page List",
};

export const useCelera = initializeCelera({
    sceneKeys: sceneKeys,
    xSize: 10,
    ySize: 10,
    initialScene: "main",
    // don't actually persist, just for demo
    persist: false,
    localizeWidget: (_scene, _layout, widget) => WidgetNames[widget] || widget,
    initializeWidgets: (widgets) => {
        // initialize all widgets
        // if persist is true, this is where
        // we add any missing widgets when loading from store
        for (const key in WidgetNames) {
            if (!widgets[key]) {
                widgets[key] = {};
            }
        }
        return widgets;
    },
    initializeLayouts: (layouts) => {
        // initialize all layouts
        if (!layouts["main"]) {
            layouts["main"] = [
                {
                    widget: "logo",
                    dim: { x: 0, y: 0, w: 2, h: 1 },
                },
                {
                    widget: "controller",
                    dim: { x: 2, y: 0, w: 8, h: 1 },
                },
                {
                    widget: "page-list",
                    dim: { x: 0, y: 1, w: 2, h: 9 },
                },
                {
                    widget: "page",
                    dim: { x: 2, y: 1, w: 8, h: 9 },
                },
            ];
        }
        return layouts;
    },
    initializeScenes: (scenes) => {
        // initialize all scenes
        if (!scenes["main"]) {
            scenes["main"] = {
                currentLayout: "main",
                layouts: ["main"],
                widgets: {
                    required: ["controller"],
                },
            };
        }
        return scenes as SceneMap<SceneKey>;
    },
});
