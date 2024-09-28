import { memo } from "react";

import Markdown from "react-markdown";

export type PageProps = {
    content: string;
};

export const Page: React.FC<PageProps> = memo(({ content }) => {
    return <Markdown>{content}</Markdown>;
});
