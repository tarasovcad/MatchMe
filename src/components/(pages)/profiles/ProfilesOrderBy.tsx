"use client";
import {
  Activity,
  ArrowDownAZ,
  Check,
  ChevronDown,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {motion} from "framer-motion";
import {itemDropdownVariants, menuVariants} from "@/utils/other/variants";
import {useState} from "react";
import {ProfileQueryParams} from "@/types/profiles/sortProfiles";

const orderByOptions = [
  // {
  //   label: "Most Popular",
  //   img: TrendingUp,
  // },
  // {
  //   label: "Recently Active",
  //   img: Activity,
  // },
  {
    label: "New Users",
    img: UserPlus,
  },
  {
    label: "Alphabetical Order",
    img: ArrowDownAZ,
  },
];

export default function ProfilesOrderBy({
  setQueryParams,
  queryParams,
}: {
  setQueryParams: (params: ProfileQueryParams) => void;
  queryParams: ProfileQueryParams;
}) {
  const [selectedOrderBy, setSelectedOrderBy] = useState(() => {
    if (
      queryParams.sort.field === "created_at" &&
      queryParams.sort.direction === "desc"
    ) {
      return "New Users";
    } else if (
      queryParams.sort.field === "name" &&
      queryParams.sort.direction === "asc"
    ) {
      return "Alphabetical Order";
    } else {
      return "Order by";
    }
  });

  const handleOrderByChange = (label: string) => {
    setSelectedOrderBy(label);

    if (label === "New Users") {
      setQueryParams({
        ...queryParams,
        sort: {
          field: "created_at",
          direction: "desc",
        },
      });
    } else if (label === "Alphabetical Order") {
      setQueryParams({
        ...queryParams,
        sort: {
          field: "name",
          direction: "asc",
        },
      });
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"xs"} className="max-[480px]:w-full">
          {selectedOrderBy}
          <ChevronDown
            size={16}
            strokeWidth={2}
            className="text-foreground/90"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent asChild side="bottom" align="center" sideOffset={4}>
        <motion.div
          initial="closed"
          animate="open"
          variants={menuVariants}
          className="space-y-2 rounded-lg min-w-[160px]">
          <DropdownMenuGroup>
            {orderByOptions.map((option) => {
              return (
                <motion.div variants={itemDropdownVariants} key={option.label}>
                  <DropdownMenuItem
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => handleOrderByChange(option.label)}>
                    <div className="flex items-center gap-2">
                      <option.img
                        size={16}
                        className="opacity-60"
                        aria-hidden="true"
                      />
                      {option.label}
                    </div>
                    {selectedOrderBy === option.label && (
                      <Check
                        size={16}
                        className="opacity-60"
                        aria-hidden="true"
                      />
                    )}
                  </DropdownMenuItem>
                </motion.div>
              );
            })}
          </DropdownMenuGroup>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
