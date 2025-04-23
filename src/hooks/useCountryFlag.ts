"use client";
import {useEffect, useState} from "react";

// Create a hook to fetch a single country's details by name
export const useCountryFlag = (countryName: string) => {
  const [flag, setFlag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!countryName) return;

    const fetchCountryFlag = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use the REST Countries API to search by country name
        const res = await fetch(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`,
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch country data: ${res.status}`);
        }

        const data = await res.json();

        // If country is found, get its flag
        if (data && data.length > 0) {
          setFlag(data[0].flags.svg);
        } else {
          setFlag(null);
        }
      } catch (error) {
        console.error("Error fetching country flag:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountryFlag();
  }, [countryName]);

  return {flag, isLoading, error};
};
