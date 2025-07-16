import React from "react";

const ProfileMiniCardSkeleton = () => {
  return (
    <div className="w-full border border-border rounded-[12px] max-w-[362px] relative">
      <div className="p-[24px] relative z-5 flex flex-col gap-4">
        {/* name and role */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Avatar skeleton */}
          <div className="bg-gray-200 rounded-full w-[65px] h-[65px] animate-pulse" />

          <div className="flex flex-col gap-0.5 items-center">
            {/* Name skeleton */}
            <div className="bg-gray-200 rounded-[4px] w-[120px] h-[23px] animate-pulse" />
            {/* Username skeleton */}
            <div className="bg-gray-200 rounded-[4px] w-[100px] h-[20px] animate-pulse" />
          </div>
        </div>

        {/* buttons skeleton */}
        <div className="flex items-center gap-1.5 justify-center">
          {/* Follow button skeleton */}
          <div className="bg-gray-200 rounded-[4px] w-[126px] h-[28px] animate-pulse" />
          {/* Message button skeleton */}
          <div className="bg-gray-200 rounded-[4px] w-[126px] h-[28px] animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProfileMiniCardSkeleton;
