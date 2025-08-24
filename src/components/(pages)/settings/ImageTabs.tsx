import ImageUpload from "@/components/ui/form/ImageUpload";
import React, {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {cn} from "@/lib/utils";

const ImageTabs = ({id, readOnly = false}: {id: string; readOnly?: boolean}) => {
  const [selectedTab, setSelectedTab] = useState<string>("");

  useEffect(() => {
    if (id === "profile_image") {
      setSelectedTab("Profile Image");
    } else if (id === "project_image") {
      setSelectedTab("Project Image");
    } else {
      setSelectedTab("Profile Image");
    }
  }, [id]);

  const renderTabContent = () => {
    if (selectedTab === "Profile Image") {
      return <ImageUpload name="profile_image" type="avatar" readOnly={readOnly} />;
    } else if (selectedTab === "Background Image") {
      return (
        <ImageUpload
          name="background_image"
          type="background"
          aspectRatio={1184 / 156}
          circularCrop={false}
          initialCropWidth={100}
          cropInstructions="Adjust the grid to crop your background image"
          readOnly={readOnly}
        />
      );
    } else if (selectedTab === "Project Image") {
      return <ImageUpload name="project_image" type="project" readOnly={readOnly} />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {id === "profile_image" ? (
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
        ) : id === "project_image" ? (
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
