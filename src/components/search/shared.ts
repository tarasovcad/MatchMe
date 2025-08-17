export interface QuickActionSection {
  id: string;
  title: string;
  icon: React.ElementType;
}

export const GROUP_HEADING_CLASSES =
  "!px-0 pt-0 [&_[cmdk-group-heading]]:!text-secondary [&_[cmdk-group-heading]]:!font-medium [&_[cmdk-group-heading]]:text-[15px] [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2";
export const STICKY_HEADING_CLASSES =
  "[&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:bg-background [&_[cmdk-group-heading]]:z-[20]";
export const ITEM_BASE_CLASSES = "!px-3 !py-2.5 transition-all duration-150 ease-in-out";
