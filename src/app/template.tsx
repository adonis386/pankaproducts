"use client";

import type { ReactNode } from "react";
import FadeContent from "@/components/react-bits/FadeContent";

/**
 * Next.js remounts `template` on every navigation — ideal for a soft enter transition on the main content shell.
 * @see https://reactbits.dev — FadeContent (GSAP)
 */
export default function RootTemplate({ children }: { children: ReactNode }) {
  return (
    <FadeContent
      scrollTriggered={false}
      blur
      duration={720}
      ease="power2.out"
      delay={0}
      className="w-full min-h-full"
    >
      {children}
    </FadeContent>
  );
}
