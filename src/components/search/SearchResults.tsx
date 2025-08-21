"use client";

import React from "react";
import {CommandGroup, CommandItem} from "@/components/shadcn/command";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/shadcn/avatar";
import {getNameInitials} from "@/functions/getNameInitials";
import {cn} from "@/lib/utils";
import {User} from "lucide-react";
import {SearchProfileResult} from "@/actions/profiles/searchProfiles";

interface ClassNames {
  groupHeading: string;
  stickyHeading: string;
  itemBase: string;
}

interface SearchResultsProps {
  section: string;
  items: unknown[];
  classNames: ClassNames;
  onProfileSelect?: (user: SearchProfileResult) => void | Promise<void>;
}

const SearchResults = ({section, items, classNames, onProfileSelect}: SearchResultsProps) => {
  switch (section) {
    case "profiles": {
      const users = (items as SearchProfileResult[]) ?? [];
      if (users.length === 0) return null;
      return (
        <CommandGroup
          heading="Profiles"
          className={cn(classNames.groupHeading, classNames.stickyHeading)}>
          {users.map((user) => (
            <CommandItem
              key={user.id}
              className={classNames.itemBase}
              value={`${user.name} ${user.username}`}
              onSelect={() => onProfileSelect?.(user)}>
              <div className="flex items-start gap-2 w-full">
                <Avatar className="h-7.5 w-7.5">
                  <AvatarImage
                    src={user.profile_image?.[0]?.url ?? undefined}
                    alt={user.name}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback>{getNameInitials(user.name)}</AvatarFallback>
                </Avatar>

                <div className="w-full text-secondary flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 text-start">
                    <span className="font-medium text-foreground text-sm">{user.name}</span>
                    <User size={16} className="text-muted-foreground/60" />
                  </div>
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      );
    }

    // Other sections to be implemented later
    case "projects":
    case "notifications":
    case "inbox":
    case "other":
    default:
      return null;
  }
};

export default SearchResults;
