"use server";
import {SkillsFormData} from "@/admin/validation/skillsValidation";
import {createClient} from "@/utils/supabase/server";

export async function setNewSkills(data: SkillsFormData) {
  const {name, imageUrl} = data;
  const supabase = await createClient();

  const {error} = await supabase
    .from("skills")
    .insert([{name, image_url: imageUrl}]);

  if (error) {
    console.log("Error inserting skills:", error);
    return {error: error.message};
  }
  return {message: "Successfully inserted skills"};
}
