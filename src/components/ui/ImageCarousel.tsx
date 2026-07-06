import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageCarouselProps {
  images: string[];
  autoPlayInterval?: number;
  className?: string;
}

export function ImageCarousel({ images, autoPlayInterval = 3000, className = "aspect-[16/9] md:aspect-[21/9]" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, images.length, autoPlayInterval]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm ${className}`}>
        <img
          src={images[0]}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const slideVariants = {
    hiddenRight: { x: '100%', opacity: 0 },
    hiddenLeft: { x: '-100%', opacity: 0 },
    visible: { x: '0', opacity: 1 },
    exitRight: { x: '100%', opacity: 0 },
    exitLeft: { x: '-100%', opacity: 0 },
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm group ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          variants={slideVariants}
          initial={direction === 1 ? 'hiddenRight' : 'hiddenLeft'}
          animate="visible"
          exit={direction === 1 ? 'exitLeft' : 'exitRight'}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePrev();
        }}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
        aria-label="Previous image"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          handleNext();
        }}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
        aria-label="Next image"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary w-6' : 'bg-gray-400/80 hover:bg-gray-600'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
