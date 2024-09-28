import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@fluentui/react-components";

import { loadPageContent, usePages } from "./page/util.ts";
import { Page } from "./page/Page.tsx";

export const PageWidget: React.FC = () => {
    const currentPage = usePages((state) => state.currentPage);
    const { isPending, data } = useQuery({
        queryKey: ["page", currentPage],
        queryFn: () => loadPageContent(currentPage),
    });
    if (isPending) {
        return <Spinner />;
    }
    return <Page content={data} />;
};
