import { Link, type LinkProps, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    container: {
        display: "inline-block",
    },
});

/**
 * React component. A link wrapper that applies inline style and prevent the lint to be split
 * up across multiple lines. See [Fluent UI Docs](https://storybooks.fluentui.dev/react/?path=/docs/components-link--docs)
 *
 * @class
 */
export const InlineLink: React.FC<LinkProps> = (props) => {
    const { children, ...rest }  =props;
    const styles = useStyles();
    return (
        <span className={styles.container}>
            <Link
                target="_blank"
                inline
                // typescript issue
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(rest as any)}
            >
                {children}
            </Link>
        </span>
    );
};
