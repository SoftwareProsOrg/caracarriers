// prisma/config is not a real package, we need to define config manually
// process.env.DATABASE_URL is optional at build time (prisma generate does not
// connect to the database). It is required at runtime for migrate and db push.

// For now, we'll just export an object since defineConfig doesn't exist
const config = {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
};

export default config;
