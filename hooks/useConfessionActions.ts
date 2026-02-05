import { useState } from "react";
import { toast } from "sonner";
import { deleteConfession, togglePin, replyToConfession } from "@/lib/actions/manage";

export function useConfessionActions(initialPinned: boolean, initialReply: string | null) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [optimisticReply, setOptimisticReply] = useState(initialReply);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setIsDeleting(true);
    const res = await deleteConfession(id);
    if (res?.error) {
      toast.error(res.error);
      setIsDeleting(false);
    } else {
      toast.success("Message deleted.");
    }
  };

  const handlePin = async (id: string) => {
    const newState = !isPinned;
    setIsPinned(newState);
    const res = await togglePin(id);
    if (res?.error) {
      toast.error(res.error);
      setIsPinned(!newState);
    } else {
      toast.success(newState ? "Pinned!" : "Unpinned.");
    }
  };

  const handleReply = async (id: string, text: string, onClose: () => void) => {
    if (!text.trim()) return;
    const loading = toast.loading("Posting...");
    const res = await replyToConfession(id, text);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Replied!");
      setOptimisticReply(text);
      onClose();
    }
    toast.dismiss(loading);
  };

  return {
    isDeleting,
    isPinned,
    optimisticReply,
    handleDelete,
    handlePin,
    handleReply
  };
}
