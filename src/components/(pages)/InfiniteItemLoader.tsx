import React, {useCallback} from "react";
import {motion} from "framer-motion";
import MainGradient, {SecGradient} from "@/components/ui/Text";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {User} from "@supabase/supabase-js";
import {
  cardVariants,
  controlsSectionVariants,
  newPeopleVariants,
  pageContainerVariants,
  pageHeaderVariants,
} from "@/utils/other/variants";
import FilterButton from "../ui/FilterButton";
import {Filter, SerializableFilter, useFilterStore} from "@/store/filterStore";
import FilterPanel from "../ui/filter/FilterPanel";
import SearchInputPage from "../ui/form/SearchInputPage";
import {useInfiniteItems} from "@/hooks/useInfiniteItems";

export type InfiniteListProps<T> = {
  userSession: User | null;
  fetchItems: (page: number, itemsPerPage: number, filters?: SerializableFilter[]) => Promise<T[]>;
  fetchUserFavorites?: (userId: string) => Promise<string[]>;
  renderItem: (
    item: T & {isFavorite?: boolean},
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
    userId: string,
  ) => React.ReactNode;
  renderSkeleton: () => React.ReactNode;
  itemsPerPage?: number;
  type: "profiles" | "projects";
  pageTitle: string;
  pageDescription: string;
  filtersData: Filter[];
};

const InfiniteItemLoader = <T extends {id: string}>({
  userSession,
  fetchItems,
  fetchUserFavorites,
  renderItem,
  renderSkeleton,
  itemsPerPage = 15,
  type = "profiles",
  filtersData,
  pageTitle,
  pageDescription,
}: InfiniteListProps<T>) => {
  const userId = userSession?.id || "";

  const {getSerializableFilters} = useFilterStore();
  const serializableFilters = getSerializableFilters(type);

  // Use the custom hook for data fetching
  const {items, isLoadingInitial, isLoadingMore, hasMore, loadMore, isError, error} =
    useInfiniteItems({
      type,
      userId,
      itemsPerPage,
      serializableFilters,
      fetchItems,
      fetchUserFavorites,
    });

  // Intersection observer for infinite loading
  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingInitial || isLoadingMore || !hasMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        {
          rootMargin: "0px 0px 1500px 0px", // Start fetching when element is 1500px away from viewport
          threshold: 0.1, // Trigger when 10% of the element is visible
        },
      );

      if (node) observer.observe(node);

      // Cleanup
      return () => observer.disconnect();
    },
    [isLoadingInitial, isLoadingMore, hasMore, loadMore],
  );

  const renderSkeletonCards = () => {
    return Array(itemsPerPage)
      .fill(null)
      .map((_, index) => <div key={`skeleton-${index}`}>{renderSkeleton()}</div>);
  };

  // Handle errors
  if (isError) {
    console.error("Error fetching items:", error);
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={pageContainerVariants}>
      <motion.div
        className="flex flex-col justify-center items-center gap-2.5 py-14"
        variants={pageHeaderVariants}>
        <motion.div
          className="flex items-center gap-1.5 px-3 py-[5px] border border-border rounded-full"
          variants={newPeopleVariants}>
          <div className="relative flex justify-center items-center w-2.5 h-2.5">
            <div className="bg-primary rounded-full w-2 h-2"></div>
            <div className="top-0 left-0 absolute bg-primary/50 rounded-full w-2.5 h-2.5 animate-ping"></div>
          </div>
          <MainGradient as="span" className="font-medium text-xs text-center">
            3 new people added
          </MainGradient>
        </motion.div>
        <MainGradient
          as="h1"
          className="font-semibold text-3xl sm:text-4xl lg:text-5xl text-center">
          {pageTitle}
        </MainGradient>
        <SecGradient
          as="h2"
          className="px-3 max-w-[742px] text-[15px] sm:text-[16px] lg:text-[18px] text-center">
          {pageDescription}
        </SecGradient>
      </motion.div>
      <motion.div className="flex flex-col gap-4" variants={controlsSectionVariants}>
        <motion.div
          className="flex justify-between items-center gap-3"
          variants={controlsSectionVariants}>
          <SearchInputPage
            pageKey={type}
            loading={{initial: isLoadingInitial, more: isLoadingMore}}
          />
          <FilterButton pageKey={type} data={filtersData} />
        </motion.div>

        <FilterPanel pageKey={type} />

        <div className="container-query-parent">
          <div className="gap-6 container-grid grid grid-cols-3">
            {items.map((item, index) => {
              const isLast = items.length === index + 1;
              return renderItem(item, isLast, isLast ? lastItemRef : null, userId);
            })}

            {isLoadingInitial && renderSkeletonCards()}
          </div>

          {isLoadingMore && (
            <div className="flex justify-center col-span-3 py-4">
              <LoadingButtonCircle size={22} />
            </div>
          )}
        </div>

        {!isLoadingInitial &&
          !isLoadingMore &&
          !hasMore &&
          items.length > 0 &&
          items.length > itemsPerPage && (
            <motion.div
              className="py-4 text-foreground/70 text-center"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.2}}>
              No more items to load
            </motion.div>
          )}

        {!isLoadingInitial && items.length === 0 && (
          <motion.div
            className="py-14 text-[18px] text-foreground/70 text-center"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.2}}>
            No results found. Try adjusting your filters.
          </motion.div>
        )}

        {isError && (
          <motion.div
            className="py-14 text-[18px] text-red-500 text-center"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.2}}>
            Error loading items. Please try again.
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InfiniteItemLoader;
