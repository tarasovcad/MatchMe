"use server";

import {createClient} from "@/utils/supabase/server";
import {redis} from "@/utils/redis/redis";

const CACHE_TTL = 60 * 60 * 12; // 12 hours cache

export async function getNewItemsCount(table: "profiles" | "projects"): Promise<number> {
  try {
    const CACHE_KEY = `${table}:new_count:24h`;

    // Check cache first
    const cachedCount = await redis.get(CACHE_KEY);
    if (cachedCount !== null) {
      return Number(cachedCount);
    }

    const supabase = await createClient();

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    let query = supabase
      .from(table)
      .select("*", {count: "exact", head: true})
      .gte("created_at", twentyFourHoursAgo.toISOString());

    // Add table-specific filters
    if (table === "profiles") {
      query = query.eq("is_profile_public", true);
    }

    const {count, error} = await query;

    if (error) {
      console.error(`Error fetching new ${table} count:`, error);
      return 0;
    }

    let newItemsCount = count || 0;

    if (newItemsCount === 0) {
      // genereate random number between 1 and 5
      const randomNumber = Math.floor(Math.random() * 5) + 1;
      newItemsCount = randomNumber;
    }

    // Cache the result
    await redis.set(CACHE_KEY, newItemsCount.toString(), {ex: CACHE_TTL});

    return newItemsCount;
  } catch (error) {
    console.error(`Error in getNewItemsCount for ${table}:`, error);
    return 0;
  }
}
