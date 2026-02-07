"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ReportReason, ReportStatus } from "@prisma/client";

export async function createReport(confessionId: string, reason: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in to report content." };

  // Check if confession exists
  const confession = await prisma.confession.findUnique({
    where: { id: confessionId },
    select: { id: true }
  });

  if (!confession) {
    return { error: "Message not found." };
  }

  // Check if user already reported this confession
  const existingReport = await prisma.report.findFirst({
    where: {
      confessionId,
      reporterId: session.user.id
    }
  });

  if (existingReport) {
    return { error: "You have already reported this message." };
  }

  // Create the report
  await prisma.report.create({
    data: {
      confessionId,
      reporterId: session.user.id,
      reason: reason.toUpperCase() as ReportReason,
      description: description || null
    }
  });

  return { success: true };
}

export async function getReports() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Check if user is admin or owner
  if (session.user.role === "USER") {
    return { error: "Forbidden: Admin access required" };
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      confession: {
        include: {
          sender: { select: { username: true } },
          receiver: { select: { username: true } }
        }
      },
      reporter: { select: { username: true } },
      reviewer: { select: { username: true } }
    }
  });

  return reports;
}

export async function updateReportStatus(reportId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Only admins and owners can update reports
  if (session.user.role === "USER") {
    return { error: "Forbidden: Admin access required" };
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { status: true }
  });

  if (!report) {
    return { error: "Report not found." };
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: status.toUpperCase() as ReportStatus,
      reviewedBy: session.user.id,
      reviewedAt: new Date()
    }
  });

  revalidatePath("/admin/reports");

  return { success: true };
}
