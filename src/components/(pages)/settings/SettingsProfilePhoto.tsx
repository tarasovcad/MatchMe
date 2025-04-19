import ImageUpload from "@/components/ui/form/ImageUpload";
import React, {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

const ImageTabs = ({id}: {id: string}) => {
  const [selectedTab, setSelectedTab] = useState<string>("");

  useEffect(() => {
    if (id === "profileImage") {
      setSelectedTab("Profile Image");
    } else if (id === "projectImage") {
      setSelectedTab("Project Image");
    } else {
      setSelectedTab("Profile Image");
    }
  }, [id]);

  const renderTabContent = () => {
    if (selectedTab === "Profile Image") {
      return <ImageUpload name="profileImage" type="avatar" showFallback={false} />;
    } else if (selectedTab === "Background Image") {
      return (
        <ImageUpload
          name="backgroundImage"
          type="background"
          aspectRatio={1184 / 156}
          maxWidth={1184}
          maxHeight={156}
          circularCrop={false}
          initialCropWidth={100}
          cropInstructions="Adjust the grid to crop your background image. "
        />
      );
    } else if (selectedTab === "Project Image") {
      return <ImageUpload name="projectImage" type="avatar" showFallback={false} />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {id === "profileImage" ? (
          <>
            <button
              onClick={() => setSelectedTab("Profile Image")}
              className={`px-[14px] py-2 border border-border rounded-radius w-full font-medium text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                selectedTab === "Profile Image"
                  ? "bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#E4E4E7]"
                  : "hover:bg-[#F2F2F5] dark:hover:bg-[#18181B] text-secondary hover:text-[#09090B] dark:hover:text-[#E4E4E7]"
              }`}>
              Profile Image
            </button>
            <button
              onClick={() => setSelectedTab("Background Image")}
              className={`px-[14px] py-2 border border-border rounded-radius w-full font-medium text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                selectedTab === "Background Image"
                  ? "bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#E4E4E7]"
                  : "hover:bg-[#F2F2F5] dark:hover:bg-[#18181B] text-secondary hover:text-[#09090B] dark:hover:text-[#E4E4E7]"
              }`}>
              Background Image
            </button>
          </>
        ) : id === "projectImage" ? (
          <>
            <button
              onClick={() => setSelectedTab("Project Image")}
              className={`px-[14px] py-2 border border-border rounded-radius w-full font-medium text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                selectedTab === "Project Image"
                  ? "bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#E4E4E7]"
                  : "hover:bg-[#F2F2F5] dark:hover:bg-[#18181B] text-secondary hover:text-[#09090B] dark:hover:text-[#E4E4E7]"
              }`}>
              Project Image
            </button>
            <button
              onClick={() => setSelectedTab("Background Image")}
              className={`px-[14px] py-2 border border-border rounded-radius w-full font-medium text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                selectedTab === "Background Image"
                  ? "bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#E4E4E7]"
                  : "hover:bg-[#F2F2F5] dark:hover:bg-[#18181B] text-secondary hover:text-[#09090B] dark:hover:text-[#E4E4E7]"
              }`}>
              Background Image
            </button>
          </>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: -10}}
          transition={{duration: 0.15}}>
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ImageTabs;
