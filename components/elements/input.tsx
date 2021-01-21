import { forwardRef } from "react";

import cx from "clsx";

const Input = forwardRef(
  ({ className, ...props }: JSX.IntrinsicElements["input"], ref) => (
    <input
      ref={ref as any}
      className={cx("border-2 border-black py-1 px-2", className)}
      {...props}
    />
  )
);

export default Input;
