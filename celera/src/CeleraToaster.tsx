import { useEffect } from "react";
import {
    Button,
    Link,
    Toast,
    ToastBody,
    Toaster,
    ToastFooter,
    ToastTitle,
    useId,
    useToastController,
} from "@fluentui/react-components";

import { UseCelera } from "./celera";
import { useCeleraTranslations } from "./strings/useCeleraStrings";

export type DispatchToastFn = ReturnType<
    typeof useToastController
>["dispatchToast"];

export const useCeleraToaster = <TScenes extends string, TWidget>(
    useCelera: UseCelera<TScenes, TWidget>,
    dispatchToast: DispatchToastFn,
) => {
    const error = useCelera((state) => state.error);
    const setError = useCelera((state) => state.setError);
    const t = useCeleraTranslations();
    useEffect(() => {
        if (error) {
            dispatchToast(
                <Toast appearance="inverted">
                    <ToastTitle>{t(error)}</ToastTitle>
                </Toast>,
                { intent: "error" },
            );
            setError("");
        }
    }, [error]);
};

export type CeleraToasterProps<TScenes extends string, TWidget> = {
    store: UseCelera<TScenes, TWidget>;
};

export const CeleraToaster = <TScenes extends string, TWidget>({
    store,
}: CeleraToasterProps<TScenes, TWidget>) => {
    const toasterId = useId("celera-toaster");
    const { dispatchToast } = useToastController(toasterId);
    useCeleraToaster(store, dispatchToast);
    return <Toaster toasterId={toasterId} />;
};
