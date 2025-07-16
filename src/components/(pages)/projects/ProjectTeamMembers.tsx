import React from "react";
import Image from "next/image";
import Avatar from "boring-avatars";
import {Button} from "@/components/shadcn/button";
import {Messages2} from "iconsax-react";
import {getNameInitials} from "@/functions/getNameInitials";
import ProfileMiniCard from "../profiles/ProfileMiniCard";

// Fake team member data
const teamMembers = [
  {
    id: "1",
    name: "Michael Chen",
    role: "Project Manager",
    joinedDate: "March 2024",
    profile_image: [
      {
        url: "https://d32crm5i3cn4pm.cloudfront.net/user-avatars/62aa7da3-d8e3-4343-9be1-05156c7f2081/image.jpg",
      },
    ],
    username: "michaelchen",
  },
  {
    id: "2",
    name: "Arthur Park",
    role: "UX-UI Designer",
    joinedDate: "April 2024",
    profile_image: [
      {
        url: "https://d32crm5i3cn4pm.cloudfront.net/user-avatars/62aa7da3-d8e3-4343-9be1-05156c7f2081/image.jpg",
      },
    ],
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
        <ProfileMiniCard key={member.id} profile={member} />
      ))}
    </div>
  );
};

export default ProjectTeamMembers;
