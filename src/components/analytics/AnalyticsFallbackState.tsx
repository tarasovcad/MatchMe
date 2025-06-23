import React from "react";
import {ChartNoAxesColumn, ShieldAlert} from "lucide-react";

const AnalyticsFallbackState = ({error}: {error?: Error | null}) => {
  if (error)
    return (
      <div className="sm:mx-auto sm:max-w-lg w-full">
        <div className="flex items-center justify-center rounded-md p-4">
          <div className="text-center">
            <ShieldAlert className="mx-auto size-7 text-destructive" aria-hidden={true} />
            <p className="mt-2 text-sm font-medium text-destructive">Error loading analytics</p>
            <p className="text-sm text-destructive/80">{error.message}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="sm:mx-auto sm:max-w-lg  w-full ">
      <div className="flex items-center justify-center rounded-md p-4">
        <div className="text-center">
          <ChartNoAxesColumn className="mx-auto size-7 text-secondary" aria-hidden={true} />
          <p className="mt-2 text-sm font-medium text-foreground">No data to show</p>
          <p className="text-sm text-secondary">May take 24 hours for data to load</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFallbackState;
