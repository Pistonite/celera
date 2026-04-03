import { Button, MenuItem } from "@fluentui/react-components";

import { useDark } from "self::pref";

import GithubMark from "../assets/github-mark.svg";
import GithubMarkWhite from "../assets/github-mark-white.svg";

/** Props for {@link GitHubLink} */
export interface GitHubLinkProps {
    /**
     * The URL to link to
     */
    href: string;

    as?: "button" | "submenu";
};

/**
 * Button with GitHub icon that links to the GitHub repository
 */
export const GitHubLink: React.FC<GitHubLinkProps> = (props) => {
    const { href, as = "button" } = props;
    const dark = useDark();
    const $Icon = <img src={dark ? GithubMarkWhite : GithubMark} width="16px" />;
    if (as === "button") {
        return <Button as="a" appearance="subtle" icon={$Icon} href={href} target="_blank" />;
    }

    return (
        <MenuItem icon={$Icon} onClick={() => window.open(href, "_blank")}>
            GitHub
        </MenuItem>
    );
};
