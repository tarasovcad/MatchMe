import {LoaderCircle} from "lucide-react";
import React from "react";

interface LoadingButtonCircleProps
  extends React.ComponentProps<typeof LoaderCircle> {
  size?: number;
}

const LoadingButtonCircle: React.FC<LoadingButtonCircleProps> = ({
  size = 20,
  ...props
}) => {
  return (
    <LoaderCircle
      className="relative z-10 animate-spin"
      size={size}
      {...props}
    />
  );
};

export default LoadingButtonCircle;
