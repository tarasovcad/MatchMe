import React, {useCallback} from "react";
import {motion} from "framer-motion";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {User} from "@supabase/supabase-js";
import {controlsSectionVariants} from "@/utils/other/variants";
import FilterButton from "../ui/FilterButton";
import {Filter, SerializableFilter, useFilterStore} from "@/store/filterStore";
import FilterPanel from "../ui/filter/FilterPanel";
import SearchInputPage from "../ui/form/SearchInputPage";
import {useInfiniteItems} from "@/hooks/useInfiniteItems";

export type InfiniteListProps<T> = {
  userSession: User | null;
  fetchItems: (page: number, itemsPerPage: number, filters?: SerializableFilter[]) => Promise<T[]>;
  renderItem: (
    item: T,
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
    userId: string,
  ) => React.ReactNode;
  renderSkeleton: () => React.ReactNode;
  itemsPerPage?: number;
  type: "profiles" | "projects";
  filtersData?: Filter[];
  displayFilterButton?: boolean;
  displaySearch?: boolean;
  cacheKey?: string;
  pageKey?: string; // Custom page key for filter store
};

const InfiniteItemLoader = <T extends {id: string}>({
  userSession,
  fetchItems,
  renderItem,
  renderSkeleton,
  itemsPerPage = 15,
  type = "profiles",
  filtersData,
  displayFilterButton = true,
  displaySearch = true,
  cacheKey,
  pageKey, // Custom page key for filter store
}: InfiniteListProps<T>) => {
  const userId = userSession?.id || "";

  const {getSerializableFilters} = useFilterStore();
  // Use custom pageKey if provided, otherwise use type
  const filterStoreKey = pageKey || type;
  const serializableFilters = getSerializableFilters(filterStoreKey);

  // Use the custom hook for data fetching
  const {items, isLoadingInitial, isLoadingMore, hasMore, loadMore, isError, error} =
    useInfiniteItems({
      type,
      userId,
      itemsPerPage,
      serializableFilters,
      fetchItems,
      cacheKey,
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
    <motion.div className="flex flex-col gap-4" variants={controlsSectionVariants}>
      {displaySearch && (
        <motion.div
          className="flex justify-between items-center gap-3"
          variants={controlsSectionVariants}>
          {displaySearch && (
            <SearchInputPage
              pageKey={filterStoreKey}
              loading={{initial: isLoadingInitial, more: isLoadingMore}}
            />
          )}
          {displayFilterButton && filtersData && (
            <FilterButton pageKey={filterStoreKey} data={filtersData} />
          )}
        </motion.div>
      )}

      {displayFilterButton && <FilterPanel pageKey={filterStoreKey} />}

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
  );
};

export default InfiniteItemLoader;
