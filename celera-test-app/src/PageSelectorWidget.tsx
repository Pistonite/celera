import { useCallback, useMemo } from "react";

import { usePages } from "./page/util.ts";
import { SelectTabData, Tab, TabList } from "@fluentui/react-components";

export const PageSelectorWidget: React.FC = () => {
    const currentPage = usePages((state) => state.currentPage);
    const pageNames = usePages((state) => state.pageNames);
    const setCurrentPage = usePages((state) => state.setCurrentPage);
    const pageCleanNames = useMemo(
        () => pageNames.map((name) => name.replace(/-/g, " ")),
        [pageNames],
    );

    const onSelect = useCallback(
        (_: unknown, { value }: SelectTabData) => {
            setCurrentPage(value as string);
        },
        [setCurrentPage],
    );

    return (
        <TabList vertical selectedValue={currentPage} onTabSelect={onSelect}>
            {pageNames.map((name, index) => (
                <Tab key={name} value={name}>
                    {pageCleanNames[index]}
                </Tab>
            ))}
        </TabList>
    );
};
