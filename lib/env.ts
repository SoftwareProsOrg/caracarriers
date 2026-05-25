import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),

  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_URL_DIRECT: z.string().min(1).optional(),

  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM: z.string().min(1).default("onboarding@resend.dev"),

  DOCUMENSO_API_URL: z.string().url().default("https://app.documenso.com/api/v1"),
  DOCUMENSO_API_TOKEN: z.string().min(1).optional(),
  DOCUMENSO_WEBHOOK_SECRET: z.string().optional(),

  LOAD_BOARD_PROVIDER: z.enum(["mock", "dat", "truckstop"]).default("mock"),
  LOAD_BOARD_API_KEY: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),

  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
});

const isProduction = process.env.NODE_ENV === "production";

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn("⚠ Some environment variables are missing. The app may not function correctly.");
  for (const issue of _env.error.issues) {
    console.warn("  Missing/invalid env var:", issue.path.join("."), "—", issue.message);
  }
  if (isProduction) {
    throw new Error("Invalid environment variables. Check the logs for details.");
  }
}

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "DATABASE_URL",
] as const;

export const env: z.infer<typeof envSchema> = _env.success
  ? _env.data
  : (Object.fromEntries(
      requiredVars.map((k) => [k, process.env[k] || ""])
    ) as unknown as z.infer<typeof envSchema>);
