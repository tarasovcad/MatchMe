import {createClient} from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const {visitorId, profileOwnerId, metadata} = await req.json();

    if (!visitorId || !profileOwnerId || !metadata) {
      return Response.json({error: "Missing required fields"}, {status: 400});
    }

    const supabase = await createClient();

    // Get current profile visits data or create new entry
    const {data: existingData, error: fetchError} = await supabase
      .from("profile_visits")
      .select("*")
      .eq("profile_owner_id", profileOwnerId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching profile visits:", fetchError);
      return Response.json({error: "Database error"}, {status: 500});
    }

    // Initialize counts with existing data or empty objects
    const currentCounts = existingData || {
      role_counts: {},
      skill_counts: {},
      pronoun_counts: {},
      age_distribution: {},
      looking_for_counts: {},
      availability_counts: {},
      location_counts: {},
      language_counts: {},
      current_role_counts: {},
    };

    //  function to increment count for a field
    const incrementCount = (
      countsObj: Record<string, number>,
      value: string | number,
      preserveCase = false,
    ) => {
      if (value && value !== "" && value !== null && value !== undefined) {
        const key = preserveCase ? String(value) : String(value).toLowerCase();
        countsObj[key] = (countsObj[key] || 0) + 1;
      }
    };

    if (metadata.public_current_role) {
      incrementCount(currentCounts.current_role_counts, metadata.public_current_role, true);
    }

    if (metadata.skills && Array.isArray(metadata.skills)) {
      metadata.skills.forEach((skill: string) => {
        incrementCount(currentCounts.skill_counts, skill);
      });
    }

    if (metadata.location) {
      incrementCount(currentCounts.location_counts, metadata.location);
    }

    if (metadata.age) {
      // Group ages into ranges
      const age = parseInt(metadata.age);
      let ageRange = "";
      if (age < 18) ageRange = "under-18";
      else if (age <= 24) ageRange = "18-24";
      else if (age <= 34) ageRange = "25-34";
      else if (age <= 44) ageRange = "35-44";
      else if (age <= 54) ageRange = "45-54";
      else ageRange = "55+";

      incrementCount(currentCounts.age_distribution, ageRange);
    }

    if (metadata.pronouns) {
      incrementCount(currentCounts.pronoun_counts, metadata.pronouns);
    }

    if (metadata.looking_for) {
      incrementCount(currentCounts.looking_for_counts, metadata.looking_for);
    }

    if (metadata.work_availability) {
      incrementCount(currentCounts.availability_counts, metadata.work_availability);
    }

    if (metadata.languages && Array.isArray(metadata.languages)) {
      metadata.languages.forEach((language: string) => {
        incrementCount(currentCounts.language_counts, language, true);
      });
    }

    // Upsert the data
    const {error: upsertError} = await supabase.from("profile_visits").upsert({
      profile_owner_id: profileOwnerId,
      role_counts: currentCounts.current_role_counts,
      skill_counts: currentCounts.skill_counts,
      pronoun_counts: currentCounts.pronoun_counts,
      age_distribution: currentCounts.age_distribution,
      looking_for_counts: currentCounts.looking_for_counts,
      availability_counts: currentCounts.availability_counts,
      location_counts: currentCounts.location_counts,
      language_counts: currentCounts.language_counts,
      current_role_counts: currentCounts.current_role_counts,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("Error upserting profile visits:", upsertError);
      return Response.json({error: "Failed to update profile visits"}, {status: 500});
    }

    return Response.json({success: true});
  } catch (error) {
    console.error("Unexpected error in track-visit route:", error);
    return Response.json({error: "Internal server error"}, {status: 500});
  }
}
