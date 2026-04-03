import { Link, type LinkProps, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    container: {
        display: "inline-block",
    },
});

/**
 * A link wrapper that applies inline style and prevent the lint to be split
 * up across multiple lines
 */
export const InlineLink: React.FC<LinkProps> = ({ children, ...props }) => {
    const styles = useStyles();
    return (
        <span className={styles.container}>
            <Link
                target="_blank"
                inline
                // typescript issue
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(props as any)}
            >
                {children}
            </Link>
        </span>
    );
};
