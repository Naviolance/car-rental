import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";

// src/proxy.ts already redirects non-admins away from /admin/* before a
// request even reaches this layout — this check is the documented
// defense-in-depth layer underneath it (both Next.js's and Auth.js's own
// docs are explicit that proxy coverage can silently gap if a matcher or
// route changes), not leftover duplication. It's also what makes this
// route safe if proxy.ts is ever misconfigured or bypassed.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <AdminNav />
      {children}
    </div>
  );
}
