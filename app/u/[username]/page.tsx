import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import ConfessionForm from "@/components/ConfessionForm";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import ConfessionFeed from "@/components/ConfessionFeed"; // <--- Import the Feed

export default async function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  
  // 1. Fetch User & FIRST BATCH of confessions (Take 10)
  const user = await prisma.user.findUnique({
    where: { username: username },
    include: {
      receivedConfessions: {
        orderBy: [
          { isPinned: 'desc' }, 
          { createdAt: 'desc' } 
        ],
        take: 10, // <--- LIMIT INITIAL LOAD
        include: {
            sender: { select: { username: true } },
            receiver: { select: { username: true } }
        }
      },
    },
  });

  if (!user) return notFound();

  const isOwner = session?.user?.id === user.id;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Profile Card */}
      <Card className="mb-8 text-center py-10 relative overflow-hidden">
         <div className="absolute inset-0 bg-leather-texture opacity-5 z-0" />
         <div className="relative z-10">
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-leather-pop mb-4 overflow-hidden relative shadow-xl">
               <Image 
                 src={user.image || "/placeholder-avatar.png"} 
                 alt={user.username} 
                 fill 
                 className="object-cover"
                 unoptimized 
               />
            </div>
            <h1 className="text-3xl font-bold text-leather-accent mb-2">@{user.username}</h1>
            {user.bio && <p className="text-leather-500 max-w-sm mx-auto italic">"{user.bio}"</p>}
         </div>
      </Card>

      {/* Confession Form (Only if NOT the owner) */}
      {!isOwner && (
         <ConfessionForm 
           receiverId={user.id} 
           usernamePath={user.username} 
           user={session?.user} 
         />
      )}

      {/* Confessions Feed (Replaces the old .map list) */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-leather-accent pl-2 border-l-4 border-leather-pop mb-6">
          Confessions
        </h3>
        
        {/* FIX: Pass the initial 10 items to the client component */}
        <ConfessionFeed 
            initialConfessions={user.receivedConfessions} 
            userId={user.id} 
            isOwner={isOwner} 
        />
      </div>
    </div>
  );
}
