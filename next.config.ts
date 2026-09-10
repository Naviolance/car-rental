import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only the hosts actually in use: the two Wikimedia domains and
    // Toyota's own press-photo CDN back the seed data's car photos, and
    // the Supabase project's public storage path is where admin-uploaded
    // car photos (uploadCarImage in supabaseStorage.ts) end up.
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      { protocol: "https", hostname: "toyota.cami-cfao.com" },
      {
        protocol: "https",
        hostname: "ejminyfqnccckurfzspc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
