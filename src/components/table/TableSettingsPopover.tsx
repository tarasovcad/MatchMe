import React from "react";
import {Settings, Undo2, ArrowUpDown, X, Eye} from "lucide-react";
import {Popover, PopoverTrigger, PopoverContent} from "@/components/shadcn/popover";
import {cn} from "@/lib/utils";
import {useReactTable} from "@tanstack/react-table";

export interface TableSettingsPopoverProps<TData extends object> {
  table: ReturnType<typeof useReactTable<TData>>;
  setColumnSizing?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  trigger?: React.ReactNode;
}

function TableSettingsPopoverInner<TData extends object>(props: TableSettingsPopoverProps<TData>) {
  const {table, setColumnSizing, trigger} = props;

  const hasSelectedRows = table.getSelectedRowModel().rows.length > 0;

  // Handlers -----------------------------------------------------------
  const handleResetColumnSizes = () => {
    if (setColumnSizing) setColumnSizing({});
    if (typeof table.resetColumnSizing === "function") {
      table.resetColumnSizing();
    }
  };

  const handleResetColumnOrder = () => {
    if (typeof table.resetColumnOrder === "function") {
      table.resetColumnOrder();
    }
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleShowAllColumns = () => {
    table.getAllLeafColumns().forEach((col) => {
      if (!col.getIsVisible()) col.toggleVisibility(true);
    });
  };

  const baseMenuItems: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
  }[] = [
    {icon: Undo2, label: "Reset column sizes", onClick: handleResetColumnSizes},
    {icon: ArrowUpDown, label: "Reset column order", onClick: handleResetColumnOrder},
    {icon: Eye, label: "Show all columns", onClick: handleShowAllColumns},
  ];

  const menuItems = hasSelectedRows
    ? [
        ...baseMenuItems.slice(0, 2),
        {icon: X, label: "Clear selection", onClick: handleClearSelection},
        ...baseMenuItems.slice(2),
      ]
    : baseMenuItems;

  // Default trigger (small icon button) -------------------------------
  const defaultTrigger = (
    <button
      type="button"
      className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors">
      <Settings className="w-4 h-4" />
    </button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger ?? defaultTrigger}</PopoverTrigger>
      <PopoverContent className="p-0 w-[190px] rounded-[8px] text-foreground/90" align="end">
        <div className="py-1 px-1">
          {menuItems.map(({icon: Icon, label, onClick}, idx) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-sm hover:bg-muted transition-colors duration-300",
                idx === menuItems.length - 2 && "border-b border-border rounded-b-none", // divider before last item
              )}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default TableSettingsPopoverInner;
