"use client";

import { WelcomeModal, useOnboarding } from "@/components/ui/WelcomeModal";

interface WelcomeModalWrapperProps {
  username?: string;
}

export default function WelcomeModalWrapper({ username }: WelcomeModalWrapperProps) {
  const { shouldShow, dismiss } = useOnboarding();

  return (
    <WelcomeModal
      isOpen={shouldShow}
      onClose={dismiss}
      username={username}
    />
  );
}
