import React, {useState} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import {Button} from "@/components/shadcn/button";
import {X} from "lucide-react";
import {motion} from "framer-motion";
import {containerVariants} from "@/utils/other/analyticsVariants";
import {SingleBar} from "./AnalyticsBarList";
import SimpleInput from "../ui/form/SimpleInput";
const AnalyticsBarListDialog = ({
  title,
  data,
  isOpen,
  setIsOpen,
}: {
  title: string;
  data: {
    label: string;
    count: number;
    percentage: number;
    relative: number;
    flag?: string;
    image?: string;
  }[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const displaySearch = data.length > 12;
  const [search, setSearch] = useState("");
  const filteredData = data.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(800px,90vh)] sm:max-w-lg [&>button:last-child]:hidden min-h-[480px]">
        <DialogHeader className="contents space-y-0 text-left">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <p className="font-medium text-[16px]">{title}</p>
            <DialogClose asChild>
              <Button size={"icon"} className="w-6 h-6">
                <X size={12} />
              </Button>
            </DialogClose>
          </div>
          <DialogTitle className="hidden">{title}</DialogTitle>
          <div className="overflow-y-auto">
            <DialogDescription asChild>
              <div className="px-4 py-4">
                {displaySearch && (
                  <div className="mb-4">
                    <SimpleInput
                      name="search"
                      placeholder="Search"
                      search
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                )}

                <motion.div
                  className="w-full flex flex-col gap-1.5 relative"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible">
                  {filteredData?.map((item, index) => {
                    return (
                      <SingleBar
                        key={`${item.label}-${item.count}-${item.percentage}-${index}`}
                        item={item}
                        labelClassName="text-[14px]"
                      />
                    );
                  })}
                </motion.div>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsBarListDialog;
