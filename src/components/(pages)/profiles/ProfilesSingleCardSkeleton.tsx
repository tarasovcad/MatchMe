import React from "react";

const ProfilesSinlgeCardSkeleton = () => {
  return (
    <div className="p-4 border border-border rounded-[12px]">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="bg-gray-200 rounded-full w-[42px] h-[42px] animate-pulse shrink-0" />

            <div>
              {/* Name skeleton */}
              <div className="bg-gray-200 rounded-[4px] w-[120px] h-[23px] animate-pulse" />
              {/* Role skeleton */}
              <div className="bg-gray-200 mt-1 rounded-[4px] w-[100px] h-[17px] animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Bell and date skeleton */}
            <div className="bg-gray-200 rounded-[4px] w-[40px] h-[17px] animate-pulse" />
          </div>
        </div>

        {/* Tagline skeleton */}
        <div className="bg-gray-200 rounded-[4px] w-full h-[20px] animate-pulse" />

        <div className="flex flex-col gap-1">
          {/* Skills skeleton - without icon */}
          <div className="bg-gray-200 rounded-[4px] w-full h-[20px] animate-pulse" />

          {/* Looking for skeleton - without icon */}
          <div className="bg-gray-200 rounded-[4px] w-[80%] h-[20px] animate-pulse" />

          {/* Languages skeleton - without icon */}
          <div className="bg-gray-200 rounded-[4px] w-[90%] h-[20px] animate-pulse" />
        </div>

        <div className="flex items-center gap-[10px] pt-3">
          {/* View profile button skeleton */}
          <div className="bg-gray-200 rounded-[4px] w-full h-[36px] animate-pulse" />

          {/* Favorite button skeleton */}
          <div className="bg-gray-200 rounded-[4px] w-[36px] h-[36px] animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProfilesSinlgeCardSkeleton;
