import React, {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import {cn} from "@/lib/utils";
import {MoreVertical} from "lucide-react";
import {
  AnimatedTooltip,
  AnimatedTooltipContent,
  AnimatedTooltipTrigger,
  AnimatedTooltipProvider,
} from "@/components/ui/AnimatedTooltip";

export type OptionsPopoverItem = {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  accent?: boolean;
  disabled?: boolean;
  separator?: boolean;
  description?: string;
};

export type OptionsPopoverProps = {
  items: OptionsPopoverItem[];
  trigger?: React.ReactNode;
  contentAlign?: "start" | "center" | "end";
  contentClassName?: string;
  withDescriptions?: boolean;
  tooltipContentClassName?: string;
  onOpenAutoFocusPrevent?: boolean;
  withTitles?: boolean;
};

const OptionsPopover: React.FC<OptionsPopoverProps> = ({
  items,
  trigger,
  contentAlign = "end",
  contentClassName = "",
  withDescriptions = false,
  tooltipContentClassName = "",
  onOpenAutoFocusPrevent = false,
  withTitles = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (onClick?: () => void) => {
    onClick?.();
    setIsOpen(false);
  };

  const contentProps = {
    className: cn(contentClassName, "p-0 w-[200px] rounded-[8px] text-foreground/90"),
    align: contentAlign,
    onOpenAutoFocus: (e: Event) => {
      if (onOpenAutoFocusPrevent) {
        e.preventDefault();
      }
    },
  };

  const defaultTrigger = (
    <button type="button" className="p-1 rounded hover:bg-muted cursor-pointer leading-none">
      <MoreVertical className="w-4 h-4 transition-all duration-200 text-muted-foreground group-hover:text-foreground/60" />
    </button>
  );

  return (
    <AnimatedTooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{trigger ?? defaultTrigger}</PopoverTrigger>

        <PopoverContent {...contentProps}>
          <div className="py-1 px-1">
            {items.map((item, index) => {
              const {icon: Icon, label, onClick, accent, disabled, separator, description} = item;
              const isFirstItem = index === 0;
              const isLastItem = index === items.length - 1;

              const buttonEl = (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleItemClick(onClick)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-sm transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed",
                    !disabled && "hover:bg-muted",
                    accent && "text-red-600 hover:text-red-700",
                  )}>
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );

              return (
                <div key={label}>
                  {withDescriptions && description ? (
                    <AnimatedTooltip
                      side="left"
                      sideOffset={8}
                      align={isFirstItem ? "start" : isLastItem ? "end" : "center"}
                      alignOffset={isFirstItem ? -4 : isLastItem ? -4 : 0}>
                      <AnimatedTooltipTrigger>
                        <span className="block">{buttonEl}</span>
                      </AnimatedTooltipTrigger>
                      <AnimatedTooltipContent
                        className={cn(
                          tooltipContentClassName,
                          "max-w-[250px] shadow-xs rounded-lg border bg-popover text-popover-foreground overflow-hidden",
                        )}>
                        {withTitles && (
                          <div className="border-b border-border px-3 py-2.5">
                            <div className="text-foreground/90 text-sm font-medium">{label}</div>
                          </div>
                        )}
                        <div className="text-muted-foreground leading-relaxed px-3 py-2.5 text-[13px]">
                          {description}
                        </div>
                      </AnimatedTooltipContent>
                    </AnimatedTooltip>
                  ) : (
                    buttonEl
                  )}
                  {separator && <div className="h-px bg-border my-1" />}
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </AnimatedTooltipProvider>
  );
};

export default OptionsPopover;
