import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// --- Cache Tag Constants ---
export const CacheTags = {
  userProfile: (username: string) => `user-${username}`,
  userConfessions: (userId: string) => `confessions-${userId}`,
  adminUsers: "admin-users",
  search: "user-search",
} as const;

// --- Cached Queries ---

// User header data (no confessions) — fast, long cache
export const getCachedUserHeader = unstable_cache(
  async (username: string) => {
    return prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, bio: true, image: true },
    });
  },
  ["user-header"],
  { revalidate: 120, tags: ["user-profiles"] }
);

// User confessions — separate query for Suspense streaming
export const getCachedUserConfessions = unstable_cache(
  async (userId: string) => {
    return prisma.confession.findMany({
      where: { receiverId: userId },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      take: 10,
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
    });
  },
  ["user-confessions"],
  { revalidate: 60, tags: ["user-profiles"] }
);

export const getCachedUserMeta = unstable_cache(
  async (username: string) => {
    return prisma.user.findUnique({
      where: { username },
      select: { bio: true },
    });
  },
  ["user-meta"],
  { revalidate: 300, tags: ["user-profiles"] }
);

export const getCachedAdminUsers = unstable_cache(
  async (query: string = "") => {
    return prisma.user.findMany({
      where: {
        username: { contains: query, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, username: true, role: true, isBanned: true, createdAt: true },
    });
  },
  ["admin-users"],
  { revalidate: 30, tags: ["admin-users"] }
);

export const getCachedSearchResults = unstable_cache(
  async (query: string) => {
    return prisma.user.findMany({
      where: {
        username: { contains: query, mode: "insensitive" },
        isBanned: false,
      },
      select: { username: true, image: true },
      take: 5,
    });
  },
  ["user-search"],
  { revalidate: 60, tags: ["user-search"] }
);
