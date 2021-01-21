import cx from "clsx";

import styles from './block.module.css'

export default function Block({
  className,
  children,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      className={cx(
        "inline-flex flex-col px-6 py-3 border-2 border-black",
        styles.block,
        className
      )}
    >
      {children}
    </div>
  );
}
