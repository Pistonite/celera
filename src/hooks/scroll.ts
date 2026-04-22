import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import { log } from "self::util";

// These are random values I picked that felt good
const MAX_SPEED = 200;
const ACCELERATION = 6.4;

/**
 * React hoook to make it so that by default, mouse wheel scrolls horizontally,
 * and Shift + mouse wheel scrolls vertically
 *
 * ```typescript
 * const { ref } = useSwappedWheelScrollDirection();
 *
 * return (<div ref={ref}> ... </div>);
 * ```
 */
export const useSwappedWheelScrollDirection = () => {
    const [serial, setSerial] = useState(0);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const setElementRef = useCallback((node: HTMLDivElement) => {
        if (elementRef.current !== node) {
            elementRef.current = node;
            setSerial((x) => x + 1);
        }
    }, []);

    const scrollStartTimeH = useRef(0);
    const scrollTargetH = useRef(0);
    const scrollSpeedH = useRef(0);
    const isScrollingH = useRef(false);
    const scrollStartTimeV = useRef(0);
    const scrollTargetV = useRef(0);
    const scrollSpeedV = useRef(0);
    const isScrollingV = useRef(false);

    const scrollToH = useCallback((target: number) => {
        if (!elementRef.current) {
            return;
        }
        executeScroll(
            elementRef.current,
            false /* isVertical */,
            target,
            scrollStartTimeH,
            scrollTargetH,
            scrollSpeedH,
            isScrollingH,
        );
    }, []);
    const scrollToV = useCallback((target: number) => {
        if (!elementRef.current) {
            return;
        }
        executeScroll(
            elementRef.current,
            true /* isVertical */,
            target,
            scrollStartTimeV,
            scrollTargetV,
            scrollSpeedV,
            isScrollingV,
        );
    }, []);

    useEffect(() => {
        if (!elementRef.current) {
            return;
        }
        const controller = new AbortController();
        elementRef.current.addEventListener(
            "wheel",
            (e: WheelEvent) => {
                // perf L - we have to preventDefault in the handler,
                // so the wheel event needs to be non-passive
                e.preventDefault();
                if (!e.deltaY || !elementRef.current) {
                    return;
                }
                const vertical = e.shiftKey;
                if (vertical) {
                    const current = isScrollingV.current
                        ? scrollTargetV.current
                        : elementRef.current.scrollTop;
                    const nextTarget = current + e.deltaY;
                    executeScroll(
                        elementRef.current,
                        true /* isVertical */,
                        nextTarget,
                        scrollStartTimeV,
                        scrollTargetV,
                        scrollSpeedV,
                        isScrollingV,
                    );
                } else {
                    const current = isScrollingH.current
                        ? scrollTargetH.current
                        : elementRef.current.scrollLeft;
                    const nextTarget = current + e.deltaY;
                    executeScroll(
                        elementRef.current,
                        false /* isVertical */,
                        nextTarget,
                        scrollStartTimeH,
                        scrollTargetH,
                        scrollSpeedH,
                        isScrollingH,
                    );
                }
            },
            {
                signal: controller.signal,
                passive: false,
            },
        );
        return () => {
            controller.abort();
        };
    }, [serial]);

    return { ref: setElementRef, scrollToH, scrollToV };
};

const executeScroll = (
    element: HTMLDivElement,
    isVertical: boolean,
    nextScrollTarget: number,
    scrollStartTime: RefObject<number>,
    scrollTarget: RefObject<number>,
    scrollSpeed: RefObject<number>,
    isScrolling: RefObject<boolean>,
) => {
    const max = isVertical
        ? element.scrollHeight - element.clientHeight
        : element.scrollWidth - element.clientWidth;
    if (max <= 0) {
        // the element is not scrollable
        return;
    }

    scrollTarget.current = Math.max(0, Math.min(nextScrollTarget, max));
    const startTime = performance.now();
    scrollStartTime.current = startTime;
    if (isScrolling.current) {
        return;
    }
    isScrolling.current = true;
    const scrollStep = () => {
        const current = isVertical ? element.scrollTop : element.scrollLeft;

        const [next, nextSpeed, nextIsScrolling] = computeScroll(
            current,
            scrollStartTime.current,
            scrollTarget.current,
            scrollSpeed.current,
        );
        if (next) {
            if (isVertical) {
                element.scrollTop = next;
            } else {
                element.scrollLeft = next;
            }
        }
        scrollSpeed.current = nextSpeed;
        if (!nextIsScrolling) {
            isScrolling.current = false;
            return;
        }
        // continue scrolling
        setTimeout(scrollStep, 10);
    };
    scrollStep();
};

const computeScroll = (
    currentValue: number,
    currentScrollStartTime: number,
    currentTarget: number,
    currentSpeed: number,
): [number | undefined /* nextValue */, number /* nextSpeed */, boolean /* nextIsScrolling */] => {
    const currentTime = performance.now();
    const elapsed = currentTime - currentScrollStartTime;
    // to ensure oscilation does not happen to cause high CPU usage,
    // we hard cap the scrolling time to 2 seconds
    if (elapsed > 2000) {
        log.warn(`scrolling took too long! (${elapsed}ms)`);
        return [currentTarget, 0, false /* done */];
    }
    let next = currentValue;
    let nextSpeed = currentSpeed;
    const currentSpeedPlus = currentSpeed + ACCELERATION;
    const nTicks = Math.ceil(currentSpeedPlus / ACCELERATION);
    const slowDownThreshold = nTicks * (currentSpeedPlus - ((nTicks - 1) * ACCELERATION) / 2);
    const remaining = Math.abs(currentTarget - currentValue);
    if (remaining <= slowDownThreshold) {
        // start slowing down
        nextSpeed = Math.max(ACCELERATION, currentSpeed - ACCELERATION);
    } else if (remaining > slowDownThreshold + currentSpeedPlus && currentSpeed < MAX_SPEED) {
        nextSpeed = Math.min(MAX_SPEED, currentSpeedPlus);
    }
    if (currentTarget > currentValue) {
        next = Math.min(currentTarget, currentValue + currentSpeed);
    } else {
        next = Math.max(currentTarget, currentValue - currentSpeed);
    }
    if (Math.abs(currentTarget - next) <= ACCELERATION) {
        // near target, stop
        return [currentTarget, 0, false /* done */];
    }
    return [next, nextSpeed, true];
};
