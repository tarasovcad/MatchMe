import React from "react";
import ProjectOpenPositionsSkeleton from "./ProjectOpenPositionsSkeleton";
import {Search} from "lucide-react";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";
import ProjectOpenPositionCard from "./ProjectOpenPositionCard";

const ProjectOpenPositions = ({
  projectId,
  userSessionId,
  openPositions,
  isLoading,
  searchQuery,
  isOwner,
  isTeamMember,
}: {
  projectId: string;
  userSessionId?: string;
  openPositions: ProjectOpenPosition[];
  isLoading: boolean;
  searchQuery?: string;
  isOwner?: boolean;
  isTeamMember?: boolean;
}) => {
  if (isLoading) {
    return <ProjectOpenPositionsSkeleton />;
  }

  if (openPositions.length === 0) {
    return (
      <div className="@container w-full">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Search size={22} className="text-foreground/80 mb-2.5" />

          {searchQuery ? (
            <>
              <h3 className="text-[16px] font-medium text-foreground mb-1.5">No positions found</h3>
              <p className="text-muted-foreground text-[13px] max-w-md leading-relaxed">
                No open positions match your search for &quot;{searchQuery}&quot;. Try a different
                search term or browse all positions.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-[16px] font-medium text-foreground mb-1.5">
                No open positions at the moment
              </h3>
              <p className="text-muted-foreground text-[13px] max-w-md leading-relaxed">
                This project isn&apos;t actively recruiting right now, but that could change soon.
                Follow the project to get notified when new positions open up.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="@container w-full">
      <div className="flex flex-col gap-6 w-full">
        {openPositions.map((openPosition) => (
          <ProjectOpenPositionCard
            key={openPosition.id}
            openPosition={openPosition}
            userId={userSessionId}
            isOwner={isOwner}
            isTeamMember={isTeamMember}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectOpenPositions;
