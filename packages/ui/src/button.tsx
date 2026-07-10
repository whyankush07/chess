"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  fn: () => void;
}

export const Button = ({ children, className, fn }: ButtonProps) => {
  return (
    <button
      className={className + " cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md"}
      onClick={() => fn()}
    >
      {children}
    </button>
  );
};
