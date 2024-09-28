import ReactGridLayout from "react-grid-layout";
import { createSelector } from "reselect";
import {
    Button,
    makeStyles,
    Menu,
    MenuButton,
    MenuCheckedValueChangeData,
    MenuItemRadio,
    MenuList,
    MenuPopover,
    MenuTrigger,
    mergeClasses,
    Select,
    SelectOnChangeData,
    shorthands,
    Tooltip,
} from "@fluentui/react-components";

import {
    canRemoveWidgetFromLayout,
    canSplitDim,
    getAvailableWidgetsForLayout,
    UseCelera,
} from "./celera";
import type {
    CeleraState,
    Layout,
    LayoutMap,
    SceneMap,
    SplitDirection,
} from "./types.ts";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRGLStyles } from "./rglStyles.ts";
import {
    Dismiss16Regular,
    SplitHorizontal16Regular,
    SplitVertical16Regular,
} from "@fluentui/react-icons";

import { useCeleraTranslations } from "./strings/useCeleraStrings.ts";
import { CeleraToaster } from "./CeleraToaster.tsx";

const useStyles = makeStyles({
    gridContainer: {
        overflow: "hidden", // prevent scrolling when editing layout with RGL
    },
    gridContainerBackground: {
        backgroundColor: "var(--colorNeutralBackground2)",
    },
    gridContainerLate: {
        "& .react-grid-layout": {
            transition: "height 200ms ease",
        },
        "& .react-grid-item": {
            transition: "all 200ms ease",
            transitionProperty: "left, top",
        },
    },
    widgetOuterContainerEditing: {
        // ...shorthands.padding("8px"),
        // ...shorthands.border("1px", "solid", "var(--colorNeutralForeground2)"),
    },
    widgetContainer: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
    },
    widgetContainerEditing: {
        ...shorthands.border("1px", "solid", "var(--colorNeutralForeground2)"),
        borderRadius: "2px",
    },
    widgetBody: {
        flex: 1,
        boxSizing: "border-box",
        ...shorthands.padding("8px"),
        overflow: "auto",
        backgroundColor: "var(--colorNeutralBackground1)",
    },
    widgetHeader: {
        boxSizing: "border-box",
        display: "flex",
        backgroundColor: "var(--colorNeutralBackground3)",
    },
    widgetHeaderSelector: {
        flex: 1,
        minWidth: 0,
        justifyContent: "space-between",
    },
});

export type WidgetProps<TScenes extends string, TWidget> = {
    scene: TScenes;
    layout: string;
    widget: string;
    data: TWidget;
    width: number;
    height: number;
};

type WidgetComponent<TScenes extends string, TWidget> = React.ComponentType<
    WidgetProps<TScenes, TWidget>
>;

export type CeleraLayoutProps<TScenes extends string, TWidget> = {
    width: number;
    height: number;
    store: UseCelera<TScenes, TWidget>;
    body: WidgetComponent<TScenes, TWidget>;
    /**
     * Don't add the default toaster
     *
     * You can use useCeleraToaster with your own Toaster
     */
    noDefaultToaster?: boolean;
    /**
     * By default, the background is set according to the Fluent UI theme.
     *
     * Set this to true for no background so you can put custom background behind
     * the layout.
     */
    noBackground?: boolean;
    /** Memoize this */
    mapLayout?: (scene: TScenes, layoutKey: string, layout: Layout) => Layout;
};

const getCurrentLayout = createSelector(
    [
        (state: CeleraState<string, any>) => state.currentScene,
        (state: CeleraState<string, any>) => state.scenes,
        (state: CeleraState<string, any>) => state.layouts,
    ],
    (scene: string, scenes: SceneMap<string>, layouts: LayoutMap) => {
        return layouts[scenes[scene].currentLayout];
    },
);

export function CeleraLayout<TScenes extends string, TWidget>({
    store: useCelera,
    body,
    noDefaultToaster,
    noBackground,
    mapLayout,
    width,
    height,
}: CeleraLayoutProps<TScenes, TWidget>): React.ReactElement | null {
    useRGLStyles();
    const classes = useStyles();

    const xSize = useCelera((state) => state.xSize);
    const ySize = useCelera((state) => state.ySize);
    const currentScene = useCelera((state) => state.currentScene);
    const currentLayoutKey = useCelera(
        (state) => state.scenes[state.currentScene].currentLayout,
    );
    const currentLayout = useCelera(getCurrentLayout);
    const isEditing = useCelera((state) => state.editing);
    const setLayout = useCelera((state) => state.setLayout);
    const layoutSerial = useCelera((state) => state.layoutSerial);

    const dimensions: ReactGridLayout.Layout[] = useMemo(() => {
        const layout = mapLayout
            ? mapLayout(currentScene, currentLayoutKey, currentLayout)
            : currentLayout;
        return layout
            .map(({ dim }, i) => {
                return {
                    i: i.toString(),
                    ...dim,
                };
            })
            .filter(({ w, h }) => w > 0 && h > 0);
    }, [
        currentScene,
        currentLayoutKey,
        currentLayout,
        mapLayout,
        layoutSerial,
    ]);

    const margin = isEditing ? 5 : 0;
    const rowHeight = (height - (ySize + 1) * margin) / ySize;

    const onLayoutChange = useCallback(
        (layout: ReactGridLayout.Layout[]) => {
            const newLayout = [...currentLayout];
            const layoutLen = layout.length;
            for (let i = 0; i < layoutLen; i++) {
                const idx = parseInt(layout[i].i);
                if (
                    !Number.isInteger(idx) ||
                    idx < 0 ||
                    idx >= currentLayout.length
                ) {
                    continue;
                }
                const { x, y, w, h } = layout[i];
                newLayout[idx] = {
                    widget: currentLayout[idx].widget,
                    dim: { x, y, w, h },
                };
            }
            setLayout(currentLayoutKey, newLayout);
        },
        [currentLayoutKey, setLayout, currentLayout],
    );

    const addLate = useRef<boolean>(false);
    const divRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        setTimeout(() => {
            addLate.current = true;
            if (divRef.current) {
                divRef.current.className = mergeClasses(
                    classes.gridContainer,
                    classes.gridContainerLate,
                );
            }
        }, 200);
    }, []);

    return (
        <div
            ref={divRef}
            style={{ width, height }}
            className={mergeClasses(
                !noBackground && classes.gridContainerBackground,
                classes.gridContainer,
                addLate.current && classes.gridContainerLate,
            )}
        >
            {!noDefaultToaster && <CeleraToaster store={useCelera} />}
            <ReactGridLayout
                key={layoutSerial}
                layout={dimensions}
                cols={xSize}
                width={width}
                rowHeight={rowHeight}
                isResizable={isEditing}
                isDraggable={isEditing}
                margin={[margin, margin]}
                onLayoutChange={onLayoutChange}
                resizeHandles={["e", "s", "se"]}
            >
                {currentLayout.map(({ widget }, i) => {
                    return (
                        <div
                            key={i}
                            className={mergeClasses(
                                isEditing &&
                                    classes.widgetOuterContainerEditing,
                            )}
                        >
                            <WidgetContainer<TScenes, TWidget>
                                store={useCelera}
                                body={body}
                                widget={widget}
                                idx={i}
                            />
                        </div>
                    );
                })}
            </ReactGridLayout>
        </div>
    );
}

export type WidgetContainerProps<TScenes extends string, TWidget> = {
    store: UseCelera<TScenes, TWidget>;
    body: WidgetComponent<TScenes, TWidget>;
    widget: string;
    idx: number;
};

export function WidgetContainer<TScenes extends string, TWidget>({
    store: useCelera,
    body: Body,
    widget,
    idx,
}: WidgetContainerProps<TScenes, TWidget>): React.ReactElement | null {
    const scenes = useCelera((state) => state.scenes);
    const layouts = useCelera((state) => state.layouts);
    const widgets = useCelera((state) => state.widgets);
    const currentScene = useCelera((state) => state.currentScene);
    const currentLayoutKey = useCelera(
        (state) => state.scenes[state.currentScene].currentLayout,
    );
    const { dim } = useCelera(getCurrentLayout)[idx];
    const data = widgets[widget];
    const editing = useCelera((state) => state.editing);
    const canSplitVertical = canSplitDim(dim, "vertical");
    const canSplitHorizontal = canSplitDim(dim, "horizontal");
    const canRemove = useMemo(() => {
        return canRemoveWidgetFromLayout(
            scenes,
            layouts[currentLayoutKey],
            currentLayoutKey,
            widget,
        );
    }, [scenes, layouts[currentLayoutKey], currentLayoutKey, widget]);
    const localizeWidget = useCelera((state) => state.localizeWidget);
    const currentName = useMemo(() => {
        if (!widget) {
            return "---";
        }
        return localizeWidget(
            currentScene,
            currentLayoutKey,
            widget,
            widgets[widget],
        );
    }, [currentScene, currentLayoutKey, widget, widgets[widget]]);
    const availableWidgets = useMemo(() => {
        if (!editing) {
            return []; // to save computation
        }
        return getAvailableWidgetsForLayout(
            scenes,
            widgets,
            currentLayoutKey,
        ).map((widget) => ({
            widget,
            name: localizeWidget(
                currentScene,
                currentLayoutKey,
                widget,
                widgets[widget],
            ),
        }));
    }, [editing, currentScene, scenes, widgets, currentLayoutKey]);
    const switchWidgetInLayout = useCelera(
        (state) => state.switchWidgetInLayout,
    );
    const onSelection = useCallback(
        (_: unknown, { checkedItems }: MenuCheckedValueChangeData) => {
            if (checkedItems[0]) {
                switchWidgetInLayout(currentLayoutKey, idx, checkedItems[0]);
            }
        },
        [currentLayoutKey, idx, switchWidgetInLayout],
    );
    const splitWidgetInLayout = useCelera((state) => state.splitWidgetInLayout);
    const split = useCallback(
        (direction: SplitDirection) => {
            splitWidgetInLayout(currentLayoutKey, idx, direction);
        },
        [currentLayoutKey, idx, splitWidgetInLayout],
    );
    const removeWidgetFromLayout = useCelera(
        (state) => state.removeWidgetFromLayout,
    );
    const remove = useCallback(() => {
        removeWidgetFromLayout(currentLayoutKey, idx);
    }, [currentLayoutKey, idx, removeWidgetFromLayout]);

    const [div, divRef] = useState<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    useLayoutEffect(() => {
        if (!div) {
            return;
        }
        const observer = new ResizeObserver(() => {
            setWidth(div.clientWidth);
            setHeight(div.clientHeight);
        });
        observer.observe(div);
        return () => {
            observer.disconnect();
        };
    }, [div]);
    const classes = useStyles();

    const t = useCeleraTranslations();

    const SIZE = "medium";

    const checkedValues = useMemo(() => ({ widget: [widget] }), [widget]);

    const Selector = canRemove ? (
        <Menu checkedValues={checkedValues} onCheckedValueChange={onSelection}>
            <MenuTrigger disableButtonEnhancement>
                <MenuButton
                    size={SIZE}
                    className={classes.widgetHeaderSelector}
                    appearance="transparent"
                >
                    {currentName}
                </MenuButton>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    {availableWidgets.map(({ widget, name }) => (
                        <MenuItemRadio
                            key={widget}
                            name="widget"
                            value={widget}
                        >
                            {name}
                        </MenuItemRadio>
                    ))}
                </MenuList>
            </MenuPopover>
        </Menu>
    ) : (
        <Tooltip relationship="label" content={t("tooltipCannotChange")}>
            <MenuButton
                disabled
                size={SIZE}
                className={classes.widgetHeaderSelector}
                appearance="subtle"
            >
                {currentName}
            </MenuButton>
        </Tooltip>
    );
    return (
        <div
            className={mergeClasses(
                classes.widgetContainer,
                editing && classes.widgetContainerEditing,
            )}
        >
            {editing && (
                <header className={classes.widgetHeader}>
                    {Selector}
                    {/* The Split icon are NOT flipped*/}
                    <Tooltip
                        relationship="label"
                        content={
                            canSplitVertical
                                ? t("buttonSplit")
                                : t("tooltipTooSmallToSplit")
                        }
                    >
                        <Button
                            disabled={!canSplitVertical}
                            appearance="transparent"
                            size={SIZE}
                            icon={<SplitHorizontal16Regular />}
                            onClick={() => split("vertical")}
                        />
                    </Tooltip>
                    <Tooltip
                        relationship="label"
                        content={
                            canSplitHorizontal
                                ? t("buttonSplit")
                                : t("tooltipTooSmallToSplit")
                        }
                    >
                        <Button
                            disabled={!canSplitHorizontal}
                            appearance="transparent"
                            size={SIZE}
                            icon={<SplitVertical16Regular />}
                            onClick={() => split("horizontal")}
                        />
                    </Tooltip>
                    <Tooltip
                        relationship="label"
                        content={
                            canRemove
                                ? t("buttonClose")
                                : t("tooltipCannotChange")
                        }
                    >
                        <Button
                            disabled={!canRemove}
                            appearance="transparent"
                            size={SIZE}
                            icon={<Dismiss16Regular />}
                            onClick={remove}
                        ></Button>
                    </Tooltip>
                </header>
            )}
            <div ref={divRef} className={classes.widgetBody}>
                <Body
                    scene={currentScene}
                    layout={currentLayoutKey}
                    widget={widget}
                    data={data}
                    width={width}
                    height={height}
                />
            </div>
        </div>
    );
}
