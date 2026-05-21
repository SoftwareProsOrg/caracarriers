import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/loads",
          "/carriers",
          "/shippers",
          "/dispatch",
          "/invoicing",
          "/documents",
          "/compliance",
          "/settings",
          "/reports",
          "/integrations",
          "/load-board",
        ],
      },
    ],
    sitemap: "https://www.caracarriers.com/sitemap.xml",
  };
}
