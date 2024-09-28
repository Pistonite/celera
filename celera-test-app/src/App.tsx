import { useEffect, useState } from "react";

import { CeleraLayout, WidgetProps } from "@pistonite/celera";
import { makeStaticStyles, shorthands } from "@griffel/react";
import { Star24Filled } from "@fluentui/react-icons";
import {
    Button,
    FluentProvider,
    Switch,
    ToggleButton,
    ToolbarButton,
    webDarkTheme,
    webLightTheme,
} from "@fluentui/react-components";
import { createUseDark, setDark } from "@pistonite/pure/pref";

import { SceneKey, useCelera } from "./celera.ts";
import { PageWidget } from "./PageWidget.tsx";
import { PageSelectorWidget } from "./PageSelectorWidget.tsx";

const useRootStyles = makeStaticStyles({
    body: {
        ...shorthands.margin(0),
        ...shorthands.padding(0),
        overflow: "hidden", // needed because if height = body height, scrollbars appear
    },
});

const LogoWidget: React.FC = () => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                flexDirection: "column",
            }}
        >
            <Star24Filled />
            <h1>Celera Layout</h1>
        </div>
    );
};

const useDark = createUseDark(useState, useEffect);

const ControllerWidget: React.FC = () => {
    const editing = useCelera((state) => state.editing);
    const startEditng = useCelera((state) => state.startEditing);
    const finishEditing = useCelera((state) => state.finishEditing);
    const darkMode = useDark();
    return (
        <div>
            <Button
                appearance="primary"
                onClick={() => {
                    if (editing) {
                        finishEditing();
                    } else {
                        startEditng();
                    }
                }}
            >
                {editing ? "Finish Editing" : "Start Editing"}
            </Button>
            <ToggleButton checked={darkMode} onClick={() => setDark(!darkMode)}>
                Toggle Dark Mode
            </ToggleButton>
        </div>
    );
};

const Widgets: React.FC<WidgetProps<SceneKey, unknown>> = ({ widget }) => {
    // this can be a switch statement, a map from widget to component,
    // more complex logic, etc.
    switch (widget) {
        case "logo":
            return <LogoWidget />;
        case "controller":
            return <ControllerWidget />;
        case "page":
            return <PageWidget />;
        case "page-list":
            return <PageSelectorWidget />;
    }
    return null;
};

function App() {
    useRootStyles();
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const darkMode = useDark();

    return (
        <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
            <CeleraLayout
                store={useCelera}
                body={Widgets}
                width={width}
                height={height}
            />
        </FluentProvider>
    );
}

export default App;
