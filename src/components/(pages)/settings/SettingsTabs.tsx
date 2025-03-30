// "use client";

// import {settingsTabsData} from "@/data/tabs/settingsTabsData";
// import Link from "next/link";
// import React, {useRef, useState, useEffect} from "react";
// import {motion} from "framer-motion";

// interface SingleTabProps {
//   link: string;
//   title: string;
//   active?: boolean;
//   onHover: (isHovered: boolean, x: number, width: number) => void;
//   updateActiveTabInfo: (x: number, width: number) => void;
// }

// const SettingsTabs = ({tab}: {tab: string | string[] | undefined}) => {
//   const [hoveredTabInfo, setHoveredTabInfo] = useState({
//     isHovered: false,
//     x: 0,
//     width: 0,
//   });

//   const [activeTabInfo, setActiveTabInfo] = useState({
//     x: 0,
//     width: 0,
//   });

//   const lastHoveredTabRef = useRef<number | null>(null);

//   const tabsContainerRef = useRef<HTMLDivElement>(null);

//   const handleTabHover = (
//     isHovered: boolean,
//     x: number,
//     width: number,
//     index?: number,
//   ) => {
//     setHoveredTabInfo({isHovered, x, width});
//     if (index !== undefined) {
//       lastHoveredTabRef.current = index;
//     }
//   };

//   const updateActiveTabInfo = (x: number, width: number) => {
//     // Only update if the values are different to prevent unnecessary re-renders
//     if (activeTabInfo.x !== x || activeTabInfo.width !== width) {
//       setActiveTabInfo({x, width});
//     }
//   };

//   const getBackgroundPosition = () => {
//     if (hoveredTabInfo.isHovered) {
//       return {
//         x: hoveredTabInfo.x,
//         width: hoveredTabInfo.width,
//       };
//     } else {
//       return {
//         x: activeTabInfo.x,
//         width: activeTabInfo.width,
//       };
//     }
//   };

//   const bgPosition = getBackgroundPosition();

//   const handleContainerMouseLeave = () => {
//     setHoveredTabInfo({isHovered: false, x: 0, width: 0});
//     lastHoveredTabRef.current = null;
//   };

//   return (
//     <div
//       className="relative overflow-x-auto whitespace-nowrap"
//       onMouseLeave={handleContainerMouseLeave}>
//       <div ref={tabsContainerRef} className="inline-flex relative items-center">
//         <motion.div
//           className="absolute bg-[#F2F2F5] dark:bg-[#18181B] border border-border rounded-radius"
//           initial={false}
//           animate={{
//             x: bgPosition.x,
//             width: bgPosition.width,
//           }}
//           transition={{
//             type: "spring",
//             stiffness: 250,
//             damping: 40,
//             mass: 1,
//           }}
//           style={{
//             height: "calc(100% - 0px)",
//             top: "0px",
//             zIndex: 0,
//           }}
//         />

//         {/* Remove the gaps entirely and use a single continuous element */}
//         <div className="flex items-center gap-2">
//           {settingsTabsData.map((settingsTab, index) => (
//             <SingleTab
//               key={settingsTab.query}
//               link={settingsTab.query}
//               title={settingsTab.title}
//               active={settingsTab.query === tab}
//               onHover={(isHovered, x, width) =>
//                 handleTabHover(isHovered, x, width, index)
//               }
//               updateActiveTabInfo={updateActiveTabInfo}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// const SingleTab = ({
//   link,
//   title,
//   active,
//   onHover,
//   updateActiveTabInfo,
// }: SingleTabProps) => {
//   const tabRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

//   useEffect(() => {
//     if (active && tabRef.current) {
//       const rect = tabRef.current.getBoundingClientRect();
//       updateActiveTabInfo(tabRef.current.offsetLeft, rect.width);
//     }
//   }, [active, updateActiveTabInfo]);

//   const handleMouseEnter = () => {
//     if (tabRef.current) {
//       const rect = tabRef.current.getBoundingClientRect();
//       onHover(true, tabRef.current.offsetLeft, rect.width);
//     }
//   };

//   const commonClasses =
//     "py-2 px-[14px] border border-border rounded-radius font-medium text-sm relative z-10";
//   const activeClasses = "text-[#09090B] dark:text-[#E4E4E7] cursor-default";
//   const inactiveClasses =
//     "text-secondary transition-colors duration-200 hover:text-[#09090B]! dark:hover:text-[#E4E4E7]! cursor-pointer";

//   return (
//     <>
//       {active ? (
//         <button
//           ref={tabRef as React.RefObject<HTMLButtonElement>}
//           className={`${commonClasses} ${activeClasses}`}
//           onMouseEnter={handleMouseEnter}>
//           {title}
//         </button>
//       ) : (
//         <Link
//           ref={tabRef as React.RefObject<HTMLAnchorElement>}
//           href={`?tab=${link}`}
//           className={`${commonClasses} ${inactiveClasses}`}
//           onMouseEnter={handleMouseEnter}>
//           {title}
//         </Link>
//       )}
//     </>
//   );
// };

// export default SettingsTabs;
import {settingsTabsData} from "@/data/tabs/settingsTabsData";
import {User} from "@supabase/supabase-js";
import Link from "next/link";
import React from "react";

interface SingleTabProps {
  link: string;
  title: string;
  active?: boolean;
  user: User;
}

const SettingsTabs = ({
  tab,
  user,
}: {
  tab: string | string[] | undefined;
  user: User;
}) => {
  return (
    <div className="flex items-center gap-2">
      {settingsTabsData.map((settingsTab) => {
        return (
          <SingleTab
            key={settingsTab.query}
            link={settingsTab.query}
            title={settingsTab.title}
            active={settingsTab.query === tab}
            user={user}
          />
        );
      })}
    </div>
  );
};

const SingleTab = ({link, title, active, user}: SingleTabProps) => {
  return (
    <>
      {active ? (
        <button className="bg-[#F4F4F5] dark:bg-[#18181B] px-[14px] py-2 border border-border rounded-radius font-medium text-[#09090B] dark:text-[#E4E4E7] text-sm cursor-default">
          {title}
        </button>
      ) : (
        <Link
          href={
            link === "profile"
              ? `/profiles/${user.user_metadata.username}`
              : `?tab=${link}`
          }
          className="hover:bg-[#F2F2F5] dark:hover:bg-[#18181B] px-[14px] py-2 border border-border rounded-radius font-medium text-secondary hover:text-[#09090B]! dark:hover:text-[#E4E4E7]! text-sm transition-colors duration-200 cursor-pointer">
          {title}
        </Link>
      )}
    </>
  );
};

export default SettingsTabs;
