"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import SecureLocalStorage from "@/utils/other/secureLocalStorage";

// Sections: e.g., "profiles", "projects", "notifications", "inbox"
export type RecentSection = string;

export interface RecentProfileItem {
  id: string; // `${username}`
  name: string;
  username: string;
  imageUrl?: string;
  type: "profile";
}

export interface RecentSearchQueryItem {
  id: string; // hash of text or text itself (kept short)
  text: string;
  type: "recent";
}

export type RecentItem = RecentProfileItem | RecentSearchQueryItem;

interface UseRecentItemsOptions {
  section: RecentSection;
  maxItems?: number;
  storageVersion?: number; // bump to invalidate incompatible shapes
}

const STORAGE_PREFIX = "mm_recent_section";

function storageKey(section: RecentSection, version = 1): string {
  return `${STORAGE_PREFIX}:${version}:${section}`;
}

function normalizeId(text: string): string {
  return text.trim().toLowerCase().slice(0, 200);
}

export function useRecentItems({
  section,
  maxItems = 10,
  storageVersion = 1,
}: UseRecentItemsOptions) {
  const key = useMemo(() => storageKey(section, storageVersion), [section, storageVersion]);
  const [items, setItems] = useState<RecentItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await SecureLocalStorage.getItem<RecentItem[]>(key);
      if (!mounted) return;
      setItems(Array.isArray(stored) ? stored : []);
      setIsReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [key]);

  const persist = useCallback(
    async (next: RecentItem[]) => {
      setItems(next);
      await SecureLocalStorage.setItem(key, next);
    },
    [key],
  );

  const addProfile = useCallback(
    async (profile: {name: string; username: string; imageUrl?: string}) => {
      const id = normalizeId(profile.username);
      const newItem: RecentProfileItem = {
        id,
        name: profile.name,
        username: profile.username,
        imageUrl: profile.imageUrl,
        type: "profile",
      };
      const filtered = items.filter((i) =>
        i.type === "profile" ? i.username !== newItem.username : true,
      );
      const next = [newItem, ...filtered].slice(0, maxItems);
      await persist(next);
    },
    [items, maxItems, persist],
  );

  const addSearchQuery = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const id = normalizeId(trimmed);
      const newItem: RecentSearchQueryItem = {id, text: trimmed, type: "recent"};
      const filtered = items.filter((i) =>
        i.type === "recent" ? i.text.toLowerCase() !== trimmed.toLowerCase() : true,
      );
      const next = [newItem, ...filtered].slice(0, maxItems);
      await persist(next);
    },
    [items, maxItems, persist],
  );

  const remove = useCallback(
    async (id: string) => {
      const next = items.filter((i) => i.id !== id);
      await persist(next);
    },
    [items, persist],
  );

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return {
    items,
    isReady,
    addProfile,
    addSearchQuery,
    remove,
    clear,
  };
}
