import type {MetadataRoute} from "next";
import {createClient} from "@/utils/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://matchme.me";
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    {url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1},
    {url: `${baseUrl}/home`, lastModified: now, changeFrequency: "weekly", priority: 0.8},
    {url: `${baseUrl}/profiles`, lastModified: now, changeFrequency: "weekly", priority: 0.7},
    {url: `${baseUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.7},
  ];

  try {
    const supabase = await createClient();

    // Public profile usernames
    const {data: profiles} = await supabase
      .from("profiles")
      .select("username, updated_at, created_at, is_profile_public")
      .eq("is_profile_public", true)
      .limit(5000);

    if (profiles) {
      for (const p of profiles) {
        const lastModified = new Date(p.updated_at || p.created_at || now);
        if (p.username) {
          urls.push({
            url: `${baseUrl}/profiles/${p.username}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }

    // Public projects by id
    const {data: projects} = await supabase
      .from("projects")
      .select("slug, updated_at, created_at, is_project_public")
      .eq("is_project_public", true)
      .limit(5000);

    if (projects) {
      for (const pr of projects) {
        const lastModified = new Date(pr.updated_at || pr.created_at || now);
        if (pr.slug) {
          urls.push({
            url: `${baseUrl}/projects/${pr.slug}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }
  } catch (e) {
    console.error("Error generating sitemap:", e);
  }

  return urls;
}
