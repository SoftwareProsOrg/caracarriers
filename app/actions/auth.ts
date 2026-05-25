"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { log } from "@/lib/logger";

const ALLOWED_DOMAIN = "caracarriers.com";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  company: z.string().min(1, "Company name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = result.data;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      log.warn("Login failed", { email, error: error.message });
      if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
        return { error: "Email not confirmed. Check your inbox or contact your administrator." };
      }
      return { error: "Invalid email or password. Please try again." };
    }
    log.info("User logged in", { email });
  } catch (err) {
    log.error("Login connection error", err as Error);
    return { error: "Unable to connect. Please try again shortly." };
  }

  redirect("/dashboard");
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password, firstName, lastName, company } = result.data;

  // Enforce domain restriction — only @caracarriers.com may register
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain !== ALLOWED_DOMAIN) {
    log.warn("Signup blocked: invalid domain", { email, domain });
    return {
      error: `Registration is restricted to @${ALLOWED_DOMAIN} addresses. Contact your administrator if you need access.`,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const { env } = await import("@/lib/env");
    const { prisma } = await import("@/lib/prisma");
    const { createServiceClient } = await import("@/lib/supabase/service");

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, company },
      },
    });
    if (error) {
      log.error("Supabase signup error", { email, error: error.message });
      if (error.message.includes("already registered")) {
        return { error: "An account with this email already exists. Try signing in." };
      }
      return { error: error.message };
    }

    if (!data?.user) {
      log.warn("Supabase signup returned no user", { email });
      return { error: "Account creation failed. Please try again." };
    }

    // Auto-confirm email if service role key is available
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const serviceClient = createServiceClient();
        await serviceClient.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
        });
        log.info("Email auto-confirmed", { email });
      } catch (confirmErr) {
        log.warn("Failed to auto-confirm email, user must check inbox", { email, error: (confirmErr as Error).message });
      }
    }

    const userId = data.user.id;
    log.info("Supabase user created, provisioning database record", { email, userId });

    // Reuse existing company if same name, otherwise create new one
    await prisma.$transaction(async (tx) => {
      let dbCompany = await tx.company.findFirst({
        where: { name: company },
      });
      if (!dbCompany) {
        dbCompany = await tx.company.create({
          data: { name: company },
        });
      }
      await tx.user.create({
        data: {
          authId: userId,
          companyId: dbCompany.id,
          firstName,
          lastName,
          email,
          role: "ADMIN",
        },
      });
    });
    log.info("Signup complete", { email, company });
  } catch (err) {
    log.error("Signup processing error", err as Error);
    return { error: "Unable to connect. Please try again shortly." };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
    log.info("User logged out");
  } catch (err) {
    log.error("Logout error", err as Error);
  }

  redirect("/login");
}
