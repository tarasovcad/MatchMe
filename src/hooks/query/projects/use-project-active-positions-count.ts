"use client";

import {useQuery} from "@tanstack/react-query";
import {getActivePositionsCount} from "@/actions/projects/getProjectOpenPositions";

const NUMBER_OF_ACTIVE_POSITIONS_LIMIT = 10;

export const useProjectActivePositionsCount = (projectId: string) => {
  return useQuery({
    queryKey: ["project-active-positions-count", projectId],
    queryFn: async () => {
      const result = await getActivePositionsCount(projectId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        count: result.count,
        limit: NUMBER_OF_ACTIVE_POSITIONS_LIMIT,
        hasReachedLimit: result.count >= NUMBER_OF_ACTIVE_POSITIONS_LIMIT,
        percentage: (result.count / NUMBER_OF_ACTIVE_POSITIONS_LIMIT) * 100,
      };
    },
    enabled: !!projectId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};
