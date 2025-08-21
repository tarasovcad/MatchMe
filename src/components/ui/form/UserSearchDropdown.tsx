"use client";

import React, {useState, useEffect} from "react";
import {useFormContext} from "react-hook-form";
import {SearchIcon, CheckIcon, X, LoaderCircle, Link} from "lucide-react";
import {Avatar, AvatarImage, AvatarFallback} from "@/components/shadcn/avatar";
import {cn} from "@/lib/utils";
import FormErrorLabel from "../FormErrorLabel";
import {useUserSearch} from "@/hooks/query/use-user-search";
import type {MiniCardMatchMeUser} from "@/types/user/matchMeUser";
import SimpleInput from "./SimpleInput";

// Debounce hook similar to the one used in multiselect
function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

interface UserSearchDropdownProps {
  name: string;
  selectedUserIdField?: string;
  placeholder?: string;
  error?: {message?: string} | undefined;
  className?: string;
  excludeUserIds?: string[]; // List of user IDs to exclude from search results
}

const UserSearchDropdown = ({
  name,
  selectedUserIdField,
  placeholder = "Search users...",
  error,
  className,
  excludeUserIds = [],
}: UserSearchDropdownProps) => {
  const {setValue, watch} = useFormContext();
  const selectedValue = watch(name);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<MiniCardMatchMeUser | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState(""); // Store the search query used when user was selected

  // Ref to access the input element
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Use Tanstack Query for fetching users
  const {data: allUsers = [], isLoading: isPending} = useUserSearch(debouncedSearchQuery);

  // Filter out excluded users
  const users = allUsers.filter((user) => !excludeUserIds.includes(user.id));

  // Reset highlighted index when users change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [users]);

  // Find selected user when selectedValue changes
  useEffect(() => {
    if (selectedValue && users.length > 0) {
      const user = users.find((u) => u.username === selectedValue || u.id === selectedValue);
      if (user && (!selectedUser || selectedUser.username !== user.username)) {
        setSelectedUser(user);
      }
    } else if (!selectedValue && selectedUser) {
      setSelectedUser(null);
    }
  }, [selectedValue, users, selectedUser]);

  const handleUserSelect = (user: MiniCardMatchMeUser) => {
    setValue(name, user.username, {shouldValidate: true});

    // Set the selected user ID if field name is provided
    if (selectedUserIdField) {
      setValue(selectedUserIdField, user.id, {shouldValidate: true});
    }

    setSelectedUser(user);
    setLastSearchQuery(searchQuery); // Store the search query that led to this selection
    setSearchQuery(""); // Clear search query
    setIsSearching(false); // Stop searching mode
    setOpen(false);
    setHighlightedIndex(-1);

    // Remove focus from input after selection
    setTimeout(() => {
      inputRef.current?.blur();
    }, 0);
  };

  const handleClear = () => {
    setValue(name, "", {shouldValidate: true});

    // Clear the selected user ID if field name is provided
    if (selectedUserIdField) {
      setValue(selectedUserIdField, "", {shouldValidate: true});
    }

    setSelectedUser(null);
    setSearchQuery("");
    setLastSearchQuery(""); // Clear the stored search query
    setIsSearching(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || users.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < users.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : users.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && users[highlightedIndex]) {
          handleUserSelect(users[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const getUserDisplayName = (user: MiniCardMatchMeUser) => {
    return user.name; // Only return the name, not the username
  };

  // Function to render dropdown content based on current state
  const renderDropdownContent = () => {
    if (isPending) {
      return <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>;
    }

    if (users.length === 0 && searchQuery.trim()) {
      return <div className="p-4 text-center text-sm text-muted-foreground">No users found</div>;
    }

    if (users.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Start typing to search users
        </div>
      );
    }

    return (
      <div className="p-1">
        {users.map((user, index) => (
          <button
            key={user.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent blur event
              handleUserSelect(user);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left text-sm",
              "hover:bg-muted",
              highlightedIndex === index && "bg-muted",
            )}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-6 w-6 text-sm">
                  <AvatarImage src={user.profile_image?.[0]?.url || undefined} />
                  <AvatarFallback className="text-sm">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="leading-none">{user.name}</span>
              </div>
              <span className="leading-none text-muted-foreground text-xs">@{user.username}</span>
            </div>
            {selectedValue === user.username && (
              <CheckIcon size={16} className="ml-auto text-primary" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Main Input Field */}
        <div className="relative">
          <SimpleInput
            type="text"
            placeholder={placeholder}
            ref={inputRef}
            value={isSearching ? searchQuery : selectedUser ? getUserDisplayName(selectedUser) : ""}
            onChange={(e) => {
              const newValue = e.target.value;
              setSearchQuery(newValue);
              setIsSearching(true);
              setHighlightedIndex(-1);

              // If user starts typing and there was a selected user, clear it
              if (selectedUser && newValue.trim()) {
                setSelectedUser(null);
                setValue(name, "", {shouldValidate: true});

                if (selectedUserIdField) {
                  setValue(selectedUserIdField, "", {shouldValidate: true});
                }
              }

              // Open dropdown when typing
              if (newValue.trim() && !open) {
                setOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // When focusing, if there's a selected user, restore the previous search query
              if (selectedUser && !isSearching) {
                setSearchQuery(lastSearchQuery);
                setIsSearching(true);
                setOpen(true);
              } else if (searchQuery.trim()) {
                setOpen(true);
              }
            }}
            onBlur={() => {
              // Delay closing to allow for item selection
              setTimeout(() => {
                setOpen(false);
                setHighlightedIndex(-1);
                // If no selection was made and we were searching, stop searching mode
                if (isSearching) {
                  setSearchQuery("");
                  setIsSearching(false);
                }
              }, 200);
            }}
            className={cn(
              "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
              selectedUser && !isSearching ? "pl-11" : "pl-9", // Space for avatar when user selected, search icon otherwise
              selectedUser && !isSearching && "pr-9", // Space for close button when user is selected
              error &&
                "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
              className,
            )}
          />

          {/* Search Icon (when searching or no user selected) */}
          {(!selectedUser || isSearching) && !isPending && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon size={16} className="text-muted-foreground/80" />
            </div>
          )}

          {/* Loading Icon (when loading) */}
          {isPending && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LoaderCircle size={16} className="text-muted-foreground/80 animate-spin" />
            </div>
          )}

          {/* User Avatar (when user is selected and not searching) */}
          {selectedUser && !isSearching && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Avatar className="w-6 h-6">
                <AvatarImage src={selectedUser.profile_image?.[0]?.url || undefined} />
                <AvatarFallback className="text-sm">{selectedUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Close button (when user is selected and not searching) */}
          {selectedUser && !isSearching && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-muted-foreground/70 hover:text-muted-foreground transition-colors rounded-sm hover:bg-muted/50 p-1 cursor-pointer"
                tabIndex={-1}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Dropdown Results */}
        {open && isSearching && searchQuery.trim().length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-60 overflow-auto">
            {renderDropdownContent()}
          </div>
        )}
      </div>

      <FormErrorLabel error={error} />
    </div>
  );
};

export default UserSearchDropdown;
