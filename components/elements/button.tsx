import classes from "clsx";

import styles from "./button.module.css";

export default function Button({
  href,
  size = "normal",
  outline,
  transition = "up",
  className,
  children,
  ...props
}: JSX.IntrinsicElements["button"] & {
  href?: JSX.IntrinsicElements["a"]["href"];
  size?: "small" | "normal" | "large";
  outline?: boolean;
  transition?: "none" | "left" | "right" | "up" | "down";
}) {
  return (
    <a href={href}>
      <button
        className={classes(
          styles.button,
          { [styles["transition-" + transition]]: transition !== "none" },
          styles[size],
          {
            [styles.outline]: outline,
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    </a>
  );
}
