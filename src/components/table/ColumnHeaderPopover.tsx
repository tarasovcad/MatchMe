import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import {cn} from "@/lib/utils";
import {ArrowDown, ArrowUp, EyeOff, Filter, Sparkles} from "lucide-react";
import type {Column as ColumnType} from "@tanstack/react-table";

type HeaderPopoverProps<TData extends object> = {
  column: ColumnType<TData, unknown>;
  children: React.ReactNode;
  trigger?: React.ReactNode;
};

const ColumnHeaderPopover = <TData extends object>({
  children,
  column,
  trigger,
}: HeaderPopoverProps<TData>) => {
  const handleSortAsc = () => {
    column.toggleSorting(false);
  };

  const handleSortDesc = () => {
    column.toggleSorting(true);
  };

  const currentSort = column.getIsSorted(); // "asc" | "desc" | false

  const menuItems: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    accent?: boolean;
    disabled?: boolean;
  }[] = [
    {icon: Sparkles, label: "AI analyze", disabled: true},
    {
      icon: ArrowUp,
      label: "Sort ascending",
      onClick: handleSortAsc,
      accent: currentSort === "asc",
    },
    {
      icon: ArrowDown,
      label: "Sort descending",
      onClick: handleSortDesc,
      accent: currentSort === "desc",
    },
    {icon: Filter, label: "Filter", disabled: true},
    {icon: EyeOff, label: "Hide column", disabled: true},
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button type="button" className="flex items-center gap-1 w-fit text-left cursor-pointer">
            {children}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[180px] rounded-[8px] text-foreground/90" align="start">
        <div className="py-1 px-1">
          {menuItems.map(({icon: Icon, label, onClick, accent, disabled}, idx) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => {
                onClick?.();
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-sm hover:bg-muted transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed",
                accent && "bg-muted font-medium text-foreground",
                idx === menuItems.length - 2 && "border-b border-border rounded-b-none", // divider before last item
              )}>
              <Icon className="w-4 h-4 text-foreground/90" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnHeaderPopover;
