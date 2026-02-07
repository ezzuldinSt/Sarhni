import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import ConfessionFeed from "@/components/ConfessionFeed";
import { EmptySentMessages } from "@/components/ui/EmptyState";

export default async function SentPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-leather-pop mb-2">Sent Messages</h1>
        <p className="text-leather-500">Messages you've sent to others</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <SentMessages userId={session.user.id} />
      </Suspense>
    </div>
  );
}

async function SentMessages({ userId }: { userId: string }) {
  const sentConfessions = await prisma.confession.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      sender: { select: { username: true } },
      receiver: { select: { username: true } },
    },
  });

  if (sentConfessions.length === 0) {
    return <EmptySentMessages />;
  }

  return (
    <ConfessionFeed
      initialConfessions={sentConfessions}
      userId={userId}
      isOwner={true}
      gridLayout={true}
      currentUserId={userId}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-48 bg-leather-700/20 rounded-3xl" />
      ))}
    </div>
  );
}
