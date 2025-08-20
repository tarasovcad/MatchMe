import {Spinner} from "@/components/shadcn/spinner";
import React from "react";

interface LoadingButtonCircleProps extends React.ComponentProps<typeof Spinner> {
  size?: number;
}

const LoadingButtonCircle: React.FC<LoadingButtonCircleProps> = ({size = 16, ...props}) => {
  return <Spinner className="z-10 relative text-foreground/80" size={size} {...props} />;
};

export default LoadingButtonCircle;
