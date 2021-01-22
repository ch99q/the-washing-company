import { forwardRef, useState } from "react";

import cx from "clsx";

import { decrypt } from "utils/encryption";

const Encrypted = forwardRef(
  (
    {
      className,
      children = "",
      encryption,
      ...props
    }: JSX.IntrinsicElements["span"] & {
      encryption?: string;
    },
    ref
  ) => {
    const text = encryption
      ? decrypt(children.toString(), encryption)
      : children.toString();

    const encrypted = text.startsWith("enc:");

    return (
      <span
        ref={ref as any}
        className={cx(
          {
            "border-2 border-black text-white py-1 px-2 bg-gray-900 rounded cursor-pointer":
              encrypted || text === "",
          },
          className
        )}
        {...props}
      >
        {encrypted
          ? "Encrypted Data"
          : text === ""
          ? "Invalid Encryption Key"
          : text}
      </span>
    );
  }
);

export default Encrypted;
