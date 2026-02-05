"use client";

import { useState, useEffect, useRef } from "react";
import ConfessionCard from "./ConfessionCard";
import { fetchConfessions } from "@/lib/actions/manage";
import { Loader2 } from "lucide-react";

interface ConfessionFeedProps {
  initialConfessions: any[];
  userId: string;
  isOwner: boolean;
}

export default function ConfessionFeed({ initialConfessions, userId, isOwner }: ConfessionFeedProps) {
  const [confessions, setConfessions] = useState(initialConfessions);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const loaderRef = useRef<HTMLDivElement>(null);

  // FIX: Sync state when the server revalidates (e.g., after sending a message)
  useEffect(() => {
    setConfessions(initialConfessions);
  }, [initialConfessions]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          
          const newConfessions = await fetchConfessions(userId, page);
          
          if (newConfessions.length === 0) {
            setHasMore(false);
          } else {
            // FIX: Ensure we don't add duplicates if revalidation happens simultaneously
            setConfessions((prev) => {
                const existingIds = new Set(prev.map(c => c.id));
                const uniqueNew = newConfessions.filter((c: any) => !existingIds.has(c.id));
                return [...prev, ...uniqueNew];
            });
            setPage((prev) => prev + 1);
          }
          
          setIsLoading(false);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, isLoading, userId]);

  return (
    <div className="space-y-6">
      {/* 1. The List */}
      {confessions.map((confession: any, i: number) => (
        <ConfessionCard 
          key={confession.id} 
          confession={confession} 
          index={i}
          isOwnerView={isOwner} 
        />
      ))}

      {/* 2. Empty State */}
      {confessions.length === 0 && (
          <div className="text-center py-12 text-leather-500 border-2 border-dashed border-leather-600/30 rounded-3xl">
             No confessions yet. Share your link!
          </div>
      )}

      {/* 3. Loading Indicator */}
      {hasMore && confessions.length > 0 && (
        <div ref={loaderRef} className="py-8 flex justify-center w-full">
           {isLoading ? (
             <Loader2 className="animate-spin text-leather-pop" />
           ) : (
             <div className="h-4 w-full" />
           )}
        </div>
      )}

      {/* 4. End of List */}
      {!hasMore && confessions.length > 0 && (
        <p className="text-center text-xs text-leather-500 py-4 uppercase tracking-widest">
          You have reached the end of the void
        </p>
      )}
    </div>
  );
}
