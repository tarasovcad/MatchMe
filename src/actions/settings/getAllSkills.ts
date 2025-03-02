"use server";
import {createClient} from "@/utils/supabase/server";

export async function getAllSkills() {
  const startTime = performance.now();
  const supabase = await createClient();

  const {data, error} = await supabase.from("skills").select("name");
  const skillNames = data?.map((skill: {name: string}) => skill.name);
  console.log("data", skillNames);
  if (error) {
    console.log("Error fetching skills:", error.message);
    return {error: error.message};
  }
  const endTime = performance.now();
  console.log(
    `Skills fetch completed in ${(endTime - startTime).toFixed(2)} ms`,
  );
  return {skillNames};
}
