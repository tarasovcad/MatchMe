import {LoaderCircle} from "lucide-react";
import React from "react";

const LoadingButtonCirlce = ({size = 20}: {size?: number}) => {
  return <LoaderCircle className="relative z-10 animate-spin" size={size} />;
};

export default LoadingButtonCirlce;
