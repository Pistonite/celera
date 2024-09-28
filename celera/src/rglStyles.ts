// This code is part of react-grid-layout
// It is modified to use @griffel/react for styling
// and some style overrides for celera, such as resize handle and dark theme

/*
The MIT License (MIT)

Copyright (c) 2016 Samuel Reed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { makeStaticStyles, shorthands } from "@griffel/react";

export const useRGLStyles = makeStaticStyles({
    ".react-grid-layout": {
        position: "relative",
    },
    ".react-grid-item img": {
        pointerEvents: "none",
        userSelect: "none",
    },
    ".react-grid-item.cssTransforms": {
        transitionProperty: "transform",
    },
    ".react.grid-item.resizing": {
        zIndex: 1,
        willChange: "width, height",
    },
    ".react-grid-item.react-draggable-dragging": {
        transition: "none",
        zIndex: 3,
        willChange: "transform",
    },
    ".react-grid-item.dropping": {
        visibility: "hidden",
    },
    ".react-grid-item.react-grid-placeholder": {
        background: "red",
        opacity: 0.2,
        transitionDuration: "100ms",
        zindex: 2,
        userSelect: "none",
    },
    ".react-grid-item > .react-resizable-handle": {
        position: "absolute",
        width: "20px",
        height: "20px",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-se::after, .react-grid-item > .react-resizable-handle.react-resizable-handle-ne::after, .react-grid-item > .react-resizable-handle.react-resizable-handle-nw::after, .react-grid-item > .react-resizable-handle.react-resizable-handle-sw::after":
        {
            content: '""',
            position: "absolute",
            right: "3px",
            bottom: "3px",
            width: "5px",
            height: "5px",
            ...shorthands.borderRight(
                "2px",
                "solid",
                "var(--colorNeutralForeground2)",
            ),
            ...shorthands.borderBottom(
                "2px",
                "solid",
                "var(--colorNeutralForeground2)",
            ),
        },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-e::after, .react-grid-item > .react-resizable-handle.react-resizable-handle-n::after, .react-grid-item > .react-resizable-handle.react-resizable-handle-w::after, .react-grid-item > .react-resizable-handle.react-resizable-handle-s::after":
        {
            content: '""',
            position: "absolute",
            right: "5px",
            bottom: "3px",
            width: "10px",
            height: "10px",
            ...shorthands.borderBottom(
                "2px",
                "solid",
                "var(--colorNeutralForeground2)",
            ),
        },
    ".react-resizable-hide > .react-resizable-handle": {
        display: "none",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-sw": {
        bottom: 0,
        left: 0,
        cursor: "sw-resize",
        transform: "rotate(90deg)",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-se": {
        bottom: 0,
        right: 0,
        cursor: "se-resize",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-nw": {
        top: 0,
        left: 0,
        cursor: "nw-resize",
        transform: "rotate(180deg)",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-ne": {
        top: 0,
        right: 0,
        cursor: "ne-resize",
        transform: "rotate(270deg)",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-w, .react-grid-item > .react-resizable-handle.react-resizable-handle-e":
        {
            top: "50%",
            marginTop: "-10px",
            cursor: "ew-resize",
        },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-w": {
        left: 0,
        transform: "rotate(90deg)",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-e": {
        right: 0,
        transform: "rotate(270deg)",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-n, .react-grid-item > .react-resizable-handle.react-resizable-handle-s":
        {
            left: "50%",
            marginLeft: "-10px",
            cursor: "ns-resize",
        },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-n": {
        top: 0,
        transform: "rotate(180deg)",
    },
    ".react-grid-item > .react-resizable-handle.react-resizable-handle-s": {
        bottom: 0,
    },
});
