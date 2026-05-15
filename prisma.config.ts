import { defineConfig } from "prisma/config";

// process.env.DATABASE_URL is optional at build time (prisma generate does not
// connect to the database). It is required at runtime for migrate and db push.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
