import {useQuery} from "@tanstack/react-query";
import {checkSlugAvailabilityAction} from "@/actions/dashboard/create-project/checkSlugAvailabilityAction";

interface SlugAvailabilityParams {
  slug: string;
}

const fetchSlugAvailability = async ({slug}: SlugAvailabilityParams) => {
  const response = await checkSlugAvailabilityAction(slug);

  if (response.error) {
    throw new Error(response.error);
  }

  return {
    isAvailable: response.message === "Slug is available",
    message: response.message,
  };
};

export const useSlugAvailability = (slug: string) => {
  return useQuery({
    queryKey: ["slug-availability", slug],
    queryFn: () => fetchSlugAvailability({slug}),
    enabled: !!slug && slug.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
