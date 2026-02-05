"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

const registerSchema = z.object({
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
});

export async function registerUser(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validated = registerSchema.safeParse(data);

  if (!validated.success) return { error: validated.error.errors[0].message };

  const { username, password } = validated.data;
  const normalizedUsername = username.toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  // FIX: Auto-promote "zhr" to OWNER
  // We use the Enum 'Role' from Prisma (imported automatically or passed as string)
  const role = normalizedUsername === "zhr" ? "OWNER" : "USER";

  try {
    await prisma.user.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        role: role, // <--- Assign Role
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') return { error: "Username already taken." };
    }
    return { error: "Registration failed." };
  }

  redirect("/login?registered=true");
}

