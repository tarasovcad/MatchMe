import {useCountriesStore} from "@/store/useCountriesStore";
import {useEffect, useState} from "react";

interface Country {
  name: {
    common: string;
  };
  flags: {
    svg: string;
  };
}

interface FormattedCountry {
  title: string;
}

export const useCountries = (shouldFetch = false) => {
  const {countries, isLoaded, setCountries} = useCountriesStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!shouldFetch || isLoaded) return;

    const fetchCountries = async () => {
      if (countries.length > 0) return;
      setIsLoading(true);

      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name");

        const data = await res.json();

        const formattedCountries = data.map((country: Country) => ({
          title: country.name.common,
        }));

        const sortedCountries = formattedCountries.sort(
          (a: FormattedCountry, b: FormattedCountry) => a.title.localeCompare(b.title),
        );

        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [shouldFetch, isLoaded, setCountries]);

  return {countries, isLoading};
};
