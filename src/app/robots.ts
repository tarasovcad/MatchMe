import type {MetadataRoute} from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/settings", "/api/"],
      },
    ],
    sitemap: "https://matchme.me/sitemap.xml",
  };
}
