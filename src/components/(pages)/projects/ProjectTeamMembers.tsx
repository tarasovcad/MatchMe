import React from "react";
import Image from "next/image";
import Avatar from "boring-avatars";
import {Button} from "@/components/shadcn/button";
import {Messages2} from "iconsax-react";
import {getNameInitials} from "@/functions/getNameInitials";

// Fake team member data
const teamMembers = [
  {
    id: "1",
    name: "Michael Chen",
    role: "Project Manager",
    joinedDate: "March 2024",
    profile_image:
      "https://d32crm5i3cn4pm.cloudfront.net/user-avatars/62aa7da3-d8e3-4343-9be1-05156c7f2081/image.jpg",
    username: "michaelchen",
  },
  {
    id: "2",
    name: "Arthur Park",
    role: "UX-UI Designer",
    joinedDate: "April 2024",
    profile_image: null, // Will use Avatar component
    username: "arthurpark",
  },
  {
    id: "3",
    name: "Mike Chen",
    role: "Python Developer",
    joinedDate: "April 2024",
    profile_image: null, // Will use Avatar component
    username: "mikechen",
  },
  {
    id: "4",
    name: "Mike Chen",
    role: "Python Developer",
    joinedDate: "April 2024",
    profile_image: null, // Will use Avatar component
    username: "mikechen",
  },
];

const ProjectTeamMembers = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teamMembers.map((member) => (
        <div
          key={member.id}
          className="w-full border border-border rounded-[12px] max-w-[362px] relative">
          <div
            className="bg-gray-200 rounded-[12px] rounded-b-none w-full absolute top-0 left-0"
            style={{
              width: "100%",
              height: "clamp(50px, 20vw, 75px)",
            }}></div>
          <div className="px-[50px] py-[36px] relative z-5 flex flex-col gap-4.5">
            {/* name and role */}
            <div className="flex flex-col items-center gap-2.5">
              {member.profile_image ? (
                <Image
                  src={member.profile_image}
                  alt="team member"
                  width={75}
                  height={75}
                  quality={100}
                  unoptimized
                  className="rounded-full object-cover border-3 border-background"
                />
              ) : (
                <div className="border-3 border-background rounded-full">
                  <Avatar
                    name={getNameInitials(member.name)}
                    width={72}
                    height={72}
                    variant="beam"
                    className="rounded-full"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1 items-center">
                <h4 className="font-medium text-foreground/80 text-[18px] leading-tight">
                  {member.name}
                </h4>
                <p className="text-[15px] text-secondary flex items-center gap-1.5 whitespace-nowrap">
                  {member.role} <span className="text-foreground/60">|</span>{" "}
                  <span className="flex items-center gap-0.5">Joined {member.joinedDate}</span>
                </p>
              </div>
            </div>
            {/* buttons*/}
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="xs" className="flex-1">
                Follow
              </Button>
              <Button variant="outline" size="xs" className="flex-1">
                <Messages2 size="16" color="currentColor" strokeWidth={3} />
                Message
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectTeamMembers;
