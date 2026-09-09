import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

// Auth.js's own docs point at "next-auth/jwt" for this augmentation, but
// that module only re-exports (`export * from "@auth/core/jwt"`) rather
// than declaring JWT itself — and the actual callback signatures import
// JWT straight from "@auth/core/jwt". Declaration merging only takes
// effect on the module that truly declares the interface, so this has to
// target @auth/core/jwt directly, or the extra fields silently don't apply.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
