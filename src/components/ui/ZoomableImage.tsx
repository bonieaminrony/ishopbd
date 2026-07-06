import React, { useState, useRef } from "react";
import { motion } from "motion/react";

export const ZoomableImage = ({
  src,
  alt,
  keyId,
}: {
  src: string;
  alt: string;
  keyId?: string;
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current || window.innerWidth <= 768) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    containerRef.current.style.setProperty("--zoom-x", `${x}%`);
    containerRef.current.style.setProperty("--zoom-y", `${y}%`);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;
    const touch = e.touches[0];
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    containerRef.current.style.setProperty("--zoom-x", `${clampedX}%`);
    containerRef.current.style.setProperty("--zoom-y", `${clampedY}%`);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth > 768) {
      setIsZoomed(!isZoomed);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (!isZoomed) {
      containerRef.current?.style.setProperty("--zoom-x", `${x}%`);
      containerRef.current?.style.setProperty("--zoom-y", `${y}%`);
    }
    setIsZoomed(!isZoomed);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden transition-all duration-300 ${isZoomed ? "cursor-zoom-out touch-none" : "cursor-zoom-in"}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      onMouseLeave={() => window.innerWidth > 768 && setIsZoomed(false)}
      style={{ "--zoom-x": "50%", "--zoom-y": "50%" } as any}
    >
      <motion.img
        key={keyId}
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: isZoomed ? 2.5 : 1 }}
        drag={false}
        style={{ transformOrigin: "var(--zoom-x) var(--zoom-y)" }}
        className="w-full h-full object-cover pointer-events-auto"
      />
      {isZoomed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white text-[10px] px-4 py-1.5 rounded-full pointer-events-none md:hidden animate-bounce">
          জুম করা আছে - টেনে দেখুন
        </div>
      )}
    </div>
  );
};

export default ZoomableImage;
