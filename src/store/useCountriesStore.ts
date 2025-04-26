import {create} from "zustand";

type Country = {
  title: string;
};

type CountriesStore = {
  countries: Country[];
  isLoaded: boolean;
  setCountries: (countries: Country[]) => void;
};

export const useCountriesStore = create<CountriesStore>((set) => ({
  countries: [],
  isLoaded: false,
  setCountries: (countries: Country[]) => {
    set({countries, isLoaded: true});
  },
}));
