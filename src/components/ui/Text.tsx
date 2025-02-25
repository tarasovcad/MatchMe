import React, {JSX} from "react";

type MainGradientProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

const MainGradient = ({
  children,
  className,
  as: Tag = "h5",
}: MainGradientProps) => {
  return (
    <Tag
      className={`bg-maingradient bg-clip-text text-transparent w-fit ${className}`}>
      {children || "undefined"}
    </Tag>
  );
};

export const SecGradient = ({
  children,
  className,
  as: Tag = "h5",
}: MainGradientProps) => {
  return (
    <Tag
      className={`bg-secgradient bg-clip-text text-transparent w-fit ${className}`}>
      {children || "undefined"}
    </Tag>
  );
};

export default MainGradient;
