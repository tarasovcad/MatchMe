"use client";
import {useEffect, useState, useMemo, useCallback} from "react";

// Simple cache to store fetched flags
const flagCache = new Map<string, string | null>();

// Create a hook to fetch a single country's details by name
export const useCountryFlag = (countryName: string) => {
  const [flag, setFlag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the country name to prevent unnecessary re-fetching
  const memoizedCountryName = useMemo(() => countryName?.trim().toLowerCase(), [countryName]);

  const fetchCountryFlag = useCallback(async () => {
    if (!memoizedCountryName) return;

    // Check cache first
    if (flagCache.has(memoizedCountryName)) {
      const cachedFlag = flagCache.get(memoizedCountryName);
      setFlag(cachedFlag ?? null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the REST Countries API to search by country name
      const res = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(memoizedCountryName)}?fullText=true`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch country data: ${res.status}`);
      }

      const data = await res.json();

      // If country is found, get its flag
      let flagUrl: string | null = null;
      if (data && data.length > 0) {
        flagUrl = data[0].flags.svg;
      }

      // Cache the result
      flagCache.set(memoizedCountryName, flagUrl);
      setFlag(flagUrl);
    } catch (error) {
      console.error("Error fetching country flag:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [memoizedCountryName]);

  useEffect(() => {
    fetchCountryFlag();
  }, [fetchCountryFlag]);

  return {flag, isLoading, error};
};
