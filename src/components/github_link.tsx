import { Button, MenuItem } from "@fluentui/react-components";

import { useDark } from "#pref";

import GithubMark from "../assets/github-mark.svg";
import GithubMarkWhite from "../assets/github-mark-white.svg";

/**
 * React component. Button with GitHub icon that links to the GitHub repository.
 */
export interface GitHubLinkProps {
    /**
     * The URL to link to
     */
    href: string;

    /**
     * Style of the button.
     *
     * "button" renders it as a button (e.g. in a toolbar) and "submenu" renders it
     * as a menu item.
     */
    as?: "button" | "submenu";
}

/**
 * React component. Button with GitHub icon that links to the GitHub repository.
 * See {@link GitHubLinkProps}
 *
 * @class
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
