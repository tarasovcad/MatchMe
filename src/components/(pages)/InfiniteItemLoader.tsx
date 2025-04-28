import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import {motion} from "framer-motion";
import SimpleInput from "@/components/ui/form/SimpleInput";
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
import {Button} from "../shadcn/button";
import {ChevronDown} from "lucide-react";
import FilterButton from "../ui/FilterButton";
import {Filter, useFilterStore} from "@/store/filterStore";
import FilterPanel from "../ui/filter/FilterPanel";

export type InfiniteListProps<T> = {
  userSession: User | null;
  fetchItems: (page: number, itemsPerPage: number, filters?: Filter[]) => Promise<T[]>;
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
  itemsPerPage = 10,
  type = "profiles",
  filtersData,
  pageTitle,
  pageDescription,
}: InfiniteListProps<T>) => {
  const [items, setItems] = useState<(T & {isFavorite?: boolean})[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState({initial: true, more: false});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showNextPageSkeletons, setShowNextPageSkeletons] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {getFiltersForPage} = useFilterStore();
  const currentFilters = useMemo(() => getFiltersForPage(type), [type, filtersData]);

  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      // Don't observe when there's no more data or when loading
      if (loading.initial || loading.more || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            timeoutRef.current = setTimeout(() => {
              setShowNextPageSkeletons(true);
              setPage((prev) => prev + 1);
            }, 300);
          }
        },
        {
          rootMargin: "0px 0px 500px 0px", // Start Fetcing when element is 500px away from viewport
          threshold: 0.1, // Trigger when 10% of the element is visible
        },
      );

      if (node) observer.current.observe(node);
    },
    [loading.initial, loading.more, hasMore],
  );

  useEffect(() => {
    if (!hasMore && observer.current) {
      observer.current.disconnect();
    }
  }, [hasMore]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    console.log("Current filters changed");
    setPage(1);
    setItems([]);
    setHasMore(true);
    fetchData();
  }, [currentFilters]);

  useEffect(() => {
    fetchData();
  }, [page, currentFilters]);

  const fetchData = async () => {
    if (page === 1) {
      setLoading((prev) => ({...prev, initial: true}));
    } else {
      setLoading((prev) => ({...prev, more: true}));
    }

    const currentUserId = userSession?.id || "";
    if (page === 1) setUserId(currentUserId);

    try {
      const allItems = await fetchItems(page, itemsPerPage, currentFilters);

      if (allItems.length === 0) {
        setHasMore(false);
        return;
      }

      const filteredItems = allItems.filter((item) => item.id !== currentUserId);

      const favorites = currentUserId ? await fetchUserFavorites!(currentUserId) : [];
      const favoritesSet = new Set(favorites);

      const profilesWithFavorites = filteredItems.map((profile) => ({
        ...profile,
        isFavorite: favoritesSet.has(profile.id),
      }));

      // Update items with new data
      setItems((prev) =>
        page === 1 ? profilesWithFavorites : [...prev, ...profilesWithFavorites],
      );
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setShowNextPageSkeletons(false);
      setLoading({initial: false, more: false});
    }
  };

  const renderSkeletonCards = () => {
    return Array(itemsPerPage)
      .fill(null)
      .map((_, index) => (
        <motion.div
          key={`skeleton-${index}`}
          variants={cardVariants}
          ref={index === 0 ? lastItemRef : undefined}>
          {renderSkeleton()}
        </motion.div>
      ));
  };

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
          className="flex max-[480px]:flex-col justify-between items-center gap-3 max-[480px]:gap-2"
          variants={controlsSectionVariants}>
          <SimpleInput placeholder="Search..." type="search" id="search" search />
          <div className="flex gap-3 max-[480px]:gap-2 max-[480px]:w-full">
            <Button size={"xs"} className="max-[480px]:w-full">
              Order by
              <ChevronDown size={16} strokeWidth={2} className="text-foreground/90" />
            </Button>
            <FilterButton pageKey={type} data={filtersData} />
          </div>
        </motion.div>

        <FilterPanel pageKey={type} />

        <div className="container-query-parent">
          <div className="gap-6 container-grid grid grid-cols-3">
            {items.map((item, index) => {
              const isLast = items.length === index + 1;
              return renderItem(item, isLast, isLast ? lastItemRef : null, userId);
            })}

            {(loading.initial || showNextPageSkeletons) && renderSkeletonCards()}
          </div>

          {loading.more && (
            <div className="flex justify-center col-span-3 py-4">
              <LoadingButtonCircle size={22} />
            </div>
          )}
        </div>
        {!loading.initial &&
          !loading.more &&
          !hasMore &&
          items.length > 0 &&
          items.length > itemsPerPage && (
            <motion.div
              className="py-4 text-foreground/70 text-center"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.5}}>
              No more items to load
            </motion.div>
          )}
      </motion.div>
    </motion.div>
  );
};

export default InfiniteItemLoader;
