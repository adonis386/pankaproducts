"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.96,
  }),
};

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

export default function ProductImageCarousel({
  images,
  alt,
  className = "",
  fit = "cover",
}: ProductImageCarouselProps) {
  const [[page, direction], setSlide] = useState([0, 0]);
  const current = wrap(0, images.length, page);
  const objectClass = fit === "contain" ? "object-contain" : "object-cover";

  const paginate = (newDirection: number) => {
    setSlide([page + newDirection, newDirection]);
  };

  if (images.length <= 1) {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <Image src={images[0]} alt={alt} fill className={objectClass} sizes="(max-width: 768px) 92vw, 480px" />
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden rounded-2xl ${className}`}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="absolute inset-0"
        >
          <Image
            src={images[current]}
            alt={`${alt} — ${current + 1}/${images.length}`}
            fill
            className={objectClass}
            sizes="(max-width: 768px) 92vw, 480px"
            priority={current === 0}
          />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={() => paginate(-1)}
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-on-surface shadow-md opacity-90 transition-opacity small:opacity-0 small:group-hover:opacity-100 hover:bg-primary hover:text-on-primary"
        aria-label="Previous image"
      >
        <HiChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => paginate(1)}
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-on-surface shadow-md opacity-90 transition-opacity small:opacity-0 small:group-hover:opacity-100 hover:bg-primary hover:text-on-primary"
        aria-label="Next image"
      >
        <HiChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {images.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            onClick={() => setSlide([dotIndex, dotIndex > current ? 1 : -1])}
            aria-label={`Go to image ${dotIndex + 1}`}
            className={`h-2 rounded-full transition-all ${
              dotIndex === current ? "w-6 bg-primary" : "w-2 bg-on-surface/30 hover:bg-on-surface/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
