import {create} from "zustand";

type SkillsStore = {
  skills: Array<{title: string}>;
  lastSearchQuery: string;
  setSkills: (skills: Array<{title: string}>, query: string) => void;
};

export const useSkillsStore = create<SkillsStore>((set) => ({
  skills: [],
  lastSearchQuery: "",
  setSkills: (skills: Array<{title: string}>, query: string) => {
    set({skills, lastSearchQuery: query});
  },
}));
