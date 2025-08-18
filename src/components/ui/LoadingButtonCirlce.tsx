import {Spinner} from "@/components/shadcn/spinner";
import React from "react";

interface LoadingButtonCircleProps extends React.ComponentProps<typeof Spinner> {
  size?: number;
}

const LoadingButtonCircle: React.FC<LoadingButtonCircleProps> = ({size = 20, ...props}) => {
  return <Spinner size={size} {...props} className="z-10 relative text-foreground/80" />;
};

export default LoadingButtonCircle;
