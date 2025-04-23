import {LoaderCircle} from "lucide-react";
import React from "react";

interface LoadingButtonCircleProps extends React.ComponentProps<typeof LoaderCircle> {
  size?: number;
}

const LoadingButtonCircle: React.FC<LoadingButtonCircleProps> = ({size = 20, ...props}) => {
  return <LoaderCircle size={size} {...props} className="z-10 relative animate-spin" />;
};

export default LoadingButtonCircle;
