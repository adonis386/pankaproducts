"use client";

/**
 * FadeContent — from React Bits (https://reactbits.dev / DavidHDev/react-bits).
 * Added `scrollTriggered` so the same animation can run on mount (e.g. App Router page changes via template.tsx).
 */
import * as React from "react";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface FadeContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** When false, fades in as soon as the component mounts (good for route transitions). Default: true (original React Bits behavior). */
  scrollTriggered?: boolean;
  container?: Element | string | null;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  scrollTriggered = true,
  container,
  blur = false,
  duration = 1000,
  ease = "power2.out",
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = "power2.in",
  onComplete,
  onDisappearanceComplete,
  className = "",
  style,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { autoAlpha: 1, filter: "blur(0px)", clearProps: "willChange" });
      return;
    }

    const startPct = (1 - threshold) * 100;
    const getSeconds = (val: number) => (val > 10 ? val / 1000 : val);

    gsap.set(el, {
      autoAlpha: initialOpacity,
      filter: blur ? "blur(10px)" : "blur(0px)",
      willChange: "opacity, filter, transform",
    });

    const tl = gsap.timeline({
      paused: true,
      delay: getSeconds(delay),
      onComplete: () => {
        onComplete?.();
        if (disappearAfter > 0) {
          gsap.to(el, {
            autoAlpha: initialOpacity,
            filter: blur ? "blur(10px)" : "blur(0px)",
            delay: getSeconds(disappearAfter),
            duration: getSeconds(disappearDuration),
            ease: disappearEase,
            onComplete: () => onDisappearanceComplete?.(),
          });
        }
      },
    });

    tl.to(el, {
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: getSeconds(duration),
      ease,
    });

    if (!scrollTriggered) {
      tl.play();
      return () => {
        tl.kill();
        gsap.killTweensOf(el);
      };
    }

    let scrollerTarget: Element | string | null =
      container || document.getElementById("snap-main-container") || null;

    if (typeof scrollerTarget === "string") {
      scrollerTarget = document.querySelector(scrollerTarget);
    }

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scrollerTarget || window,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      st.kill();
      tl.kill();
      gsap.killTweensOf(el);
    };
  }, [
    scrollTriggered,
    container,
    blur,
    duration,
    ease,
    delay,
    threshold,
    initialOpacity,
    disappearAfter,
    disappearDuration,
    disappearEase,
    onComplete,
    onDisappearanceComplete,
  ]);

  const initialStyle: React.CSSProperties | undefined =
    !scrollTriggered
      ? {
          opacity: initialOpacity,
          filter: blur ? "blur(10px)" : undefined,
          ...style,
        }
      : style;

  return (
    <div ref={ref} className={className} style={initialStyle} {...props}>
      {children}
    </div>
  );
};

export default FadeContent;
