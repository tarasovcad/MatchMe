"use server";

import {createClient} from "@/utils/supabase/server";

export const getSkillsForFilterBtn = async (query: string) => {
  const supabase = await createClient();
  const starttime = performance.now();

  try {
    const procedure = query?.trim() ? "get_filtered_skills" : "get_random_skills";
    const params = query?.trim()
      ? {search_term: query.toLowerCase(), limit_count: 50}
      : {limit_count: 80};

    const {data, error} = await supabase.rpc(procedure, params);

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    const formattedSkills = data?.map(({skill}: {skill: string}) => ({title: skill})) || [];

    console.log("End time", performance.now() - starttime);
    return formattedSkills;
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
};
