import { z } from "zod";

const envSchema = z.object({
  // Next.js / App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),

  // Database
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_DIRECT: z.string().min(1).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().min(1).optional(),

  // Resend
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM: z.string().min(1).default("onboarding@resend.dev"),

  // Documenso
  DOCUMENSO_API_URL: z.string().url().default("https://app.documenso.com/api/v1"),
  DOCUMENSO_API_TOKEN: z.string().min(1).optional(),
  DOCUMENSO_WEBHOOK_SECRET: z.string().optional(),

  // Observability
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
});

// For variables that are required in production but can be missing in development
const productionSchema = envSchema.extend({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL_DIRECT: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  DOCUMENSO_API_TOKEN: z.string().min(1),
});

const isProduction = process.env.NODE_ENV === "production";
const schema = isProduction ? productionSchema : envSchema;

const _env = schema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(_env.error.format(), null, 2));
  if (isProduction) {
    throw new Error("Invalid environment variables. Check the logs for details.");
  }
}

export const env = _env.success ? _env.data : (process.env as unknown as z.infer<typeof envSchema>);
