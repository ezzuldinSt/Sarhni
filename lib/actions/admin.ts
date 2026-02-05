"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- HELPERS ---
async function getCurrentRole() {
  const session = await auth();
  return session?.user?.role || "USER"; // Default to USER
}

// --- 1. USER MANAGEMENT (GET) ---
export async function getAllUsers(query: string = "") {
  const role = await getCurrentRole();
  if (role !== "ADMIN" && role !== "OWNER") return [];

  return await prisma.user.findMany({
    where: {
      username: { contains: query, mode: "insensitive" }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, username: true, role: true, isBanned: true, createdAt: true }
  });
}

// --- 2. BAN HAMMER ---
export async function toggleBan(targetUserId: string) {
  const session = await auth();
  const actorRole = session?.user?.role;

  if (actorRole !== "ADMIN" && actorRole !== "OWNER") return { error: "Unauthorized" };

  // Fetch target
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return { error: "User not found" };

  // HIERARCHY CHECK
  // Admins cannot ban Admins or Owners
  if (actorRole === "ADMIN" && (target.role === "ADMIN" || target.role === "OWNER")) {
    return { error: "You cannot ban your superiors or peers." };
  }
  // Owners cannot ban other Owners (if you had multiple)
  if (actorRole === "OWNER" && target.role === "OWNER") {
     return { error: "You cannot ban another Owner." };
  }

  // Execute
  await prisma.user.update({
    where: { id: targetUserId },
    data: { isBanned: !target.isBanned }
  });

  revalidatePath("/admin");
  revalidatePath("/owner");
  return { success: true };
}

// --- 3. ROLE MANAGEMENT (OWNER ONLY) ---
export async function updateUserRole(targetUserId: string, newRole: "USER" | "ADMIN") {
  const role = await getCurrentRole();
  
  if (role !== "OWNER") return { error: "Only the Owner can promote users." };

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole }
  });

  revalidatePath("/owner");
  return { success: true };
}

// --- 4. NUCLEAR OPTION (OWNER ONLY) ---
export async function deleteUserCompletely(targetUserId: string) {
  const role = await getCurrentRole();
  if (role !== "OWNER") return { error: "Only the Owner can delete users." };

  // Cascade delete is usually handled by Prisma relations, 
  // but let's be explicit to ensure cleanup
  const deleteConfessions = prisma.confession.deleteMany({
    where: { 
      OR: [{ senderId: targetUserId }, { receiverId: targetUserId }]
    }
  });

  const deleteUser = prisma.user.delete({
    where: { id: targetUserId }
  });

  await prisma.$transaction([deleteConfessions, deleteUser]);

  revalidatePath("/owner");
  return { success: true };
}

