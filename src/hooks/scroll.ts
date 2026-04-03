import { useCallback, useEffect, useRef, useState } from "react";

// These are random values I picked that felt good
const MAX_SPEED = 200;
const ACCELERATION = 6.4;

/**
 * Smooth scrolling implementation
 *
 * (A better beizer curve would probably have better experience,
 * but my little brain can't handle it)
 */
export const useScroll = (
    getter: () => number,
    setter: (scroll: number) => void,
    getMax: () => number,
) => {
    const scrollStartTime = useRef(0);
    const scrollTarget = useRef(0);
    const scrollSpeed = useRef(0); // unsigned
    const isScrolling = useRef(false);

    const scrollTo = (target: number) => {
        const max = getMax();
        if (max <= 0) {
            // the element is not scrollable
            return;
        }

        scrollTarget.current = Math.max(0, Math.min(target, max));

        const startTime = performance.now();
        scrollStartTime.current = startTime;
        if (isScrolling.current) {
            return;
        }
        isScrolling.current = true;
        // to ensure oscilation does not happen to cause high CPU usage,
        // we hard cap the scrolling time to 2 seconds
        const doScroll = () => {
            const currentTime = performance.now();
            const elapsed = currentTime - scrollStartTime.current;
            if (elapsed > 2000) {
                console.warn(`[shared-controls] scrolling took too long! (${elapsed}ms)`);
                setter(scrollTarget.current);
                scrollSpeed.current = 0;
                isScrolling.current = false;
                return;
            }
            const current = getter();
            const currentTarget = scrollTarget.current;
            let next = current;
            const currentSpeed = scrollSpeed.current;
            const currentSpeedPlus = currentSpeed + ACCELERATION;
            const nTicks = Math.ceil(currentSpeedPlus / ACCELERATION);
            const slowDownThreshold =
                nTicks * (currentSpeedPlus - ((nTicks - 1) * ACCELERATION) / 2);
            const remaining = Math.abs(currentTarget - current);
            if (remaining <= slowDownThreshold) {
                // start slowing down
                scrollSpeed.current = Math.max(ACCELERATION, currentSpeed - ACCELERATION);
            } else if (
                remaining > slowDownThreshold + currentSpeedPlus &&
                currentSpeed < MAX_SPEED
            ) {
                scrollSpeed.current = Math.min(MAX_SPEED, currentSpeedPlus);
            }
            if (currentTarget > current) {
                next = Math.min(currentTarget, current + currentSpeed);
            } else {
                next = Math.max(currentTarget, current - currentSpeed);
            }
            if (Math.abs(currentTarget - next) <= ACCELERATION) {
                // near target, stop
                next = currentTarget;
                scrollSpeed.current = 0;
                isScrolling.current = false;
                setter(next);
                return;
            }
            setter(next);
            // continue scrolling
            setTimeout(doScroll, 10);
        };
        doScroll();
    };
    const scrollToMemo = useCallback(scrollTo, [getter, setter, getMax]);

    return { scrollTarget, isScrolling, scrollTo: scrollToMemo };
};

/**
 * Make it so that by default, mouse wheel scrolls horizontally,
 * and Shift + mouse wheel scrolls vertically
 *
 * ```example
 * const { ref } = useSwappedWheelScrollDirection();
 *
 * return (<div ref={ref}> ... </div>);
 * ```
 */
export const useSwappedWheelScrollDirection = () => {
    // perf L - we have to preventDefault in the handler,
    // so the wheel event needs to be non-passive
    const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);
    const getterH = useCallback(() => {
        return elementRef?.scrollLeft || 0;
    }, [elementRef]);
    const setterH = useCallback(
        (scroll: number) => {
            if (!elementRef) {
                return;
            }
            elementRef.scrollLeft = scroll;
        },
        [elementRef],
    );
    const getMaxH = useCallback(() => {
        if (!elementRef) {
            return 0;
        }
        return elementRef.scrollWidth - elementRef.clientWidth;
    }, [elementRef]);
    const getterV = useCallback(() => {
        return elementRef?.scrollTop || 0;
    }, [elementRef]);
    const setterV = useCallback(
        (scroll: number) => {
            if (!elementRef) {
                return;
            }
            elementRef.scrollTop = scroll;
        },
        [elementRef],
    );
    const getMaxV = useCallback(() => {
        if (!elementRef) {
            return 0;
        }
        return elementRef.scrollHeight - elementRef.clientHeight;
    }, [elementRef]);

    const {
        scrollTarget: scrollTargetH,
        isScrolling: isScrollingH,
        scrollTo: scrollToH,
    } = useScroll(getterH, setterH, getMaxH);
    const {
        scrollTarget: scrollTargetV,
        isScrolling: isScrollingV,
        scrollTo: scrollToV,
    } = useScroll(getterV, setterV, getMaxV);
    const handler = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();
            if (!e.deltaY || !elementRef) {
                return;
            }
            let current;
            const vertical = e.shiftKey;
            if (vertical) {
                current = isScrollingV.current ? scrollTargetV.current : elementRef.scrollTop;
            } else {
                current = isScrollingH.current ? scrollTargetH.current : elementRef.scrollLeft;
            }
            (vertical ? scrollToV : scrollToH)(current + e.deltaY);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [elementRef],
    );

    useEffect(() => {
        if (!elementRef) {
            return;
        }
        const controller = new AbortController();
        elementRef.addEventListener("wheel", handler, {
            signal: controller.signal,
            passive: false,
        });
        return () => {
            controller.abort();
        };
        // handler depends on elementRef so just that is enough
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elementRef]);

    return { ref: setElementRef, scrollToH, scrollToV };
};
