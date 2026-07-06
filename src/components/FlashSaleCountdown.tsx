import React, { useState, useEffect } from "react";
import { Product } from "../types";

export const FlashSaleCountdown = ({ products }: { products: Product[] }) => {
  const earliestEnd = Math.min(...products.map(p => new Date(p.flashSaleEndDate!).getTime()));
  const [timeLeft, setTimeLeft] = useState(earliestEnd - Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = earliestEnd - Date.now();
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [earliestEnd]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const formatTime = (val: number) => {
    return val <= 0 ? "00" : val.toString().padStart(2, "0");
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 text-white font-black py-2">
      {/* 1. Days */}
      <div className="flex flex-col items-center group">
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg text-2xl md:text-3xl overflow-hidden transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
          <span className="relative z-10 drop-shadow-md">{formatTime(days)}</span>
        </div>
        <span className="text-[9px] md:text-[10px] text-white/95 mt-2 uppercase font-black tracking-wider text-center">দিন (DAYS)</span>
      </div>
      <span className="text-white/40 text-xl font-bold self-start mt-4 animate-pulse">:</span>

      {/* 2. Hours */}
      <div className="flex flex-col items-center group">
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg text-2xl md:text-3xl overflow-hidden transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
          <span className="relative z-10 drop-shadow-md">{formatTime(hours)}</span>
        </div>
        <span className="text-[9px] md:text-[10px] text-white/95 mt-2 uppercase font-black tracking-wider text-center">ঘণ্টা (HRS)</span>
      </div>
      <span className="text-white/40 text-xl font-bold self-start mt-4 animate-pulse">:</span>

      {/* 3. Minutes */}
      <div className="flex flex-col items-center group">
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg text-2xl md:text-3xl overflow-hidden transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
          <span className="relative z-10 drop-shadow-md">{formatTime(minutes)}</span>
        </div>
        <span className="text-[9px] md:text-[10px] text-white/95 mt-2 uppercase font-black tracking-wider text-center">মিনিট (MIN)</span>
      </div>
      <span className="text-white/40 text-xl font-bold self-start mt-4 animate-pulse">:</span>

      {/* 4. Seconds */}
      <div className="flex flex-col items-center group">
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg text-2xl md:text-3xl overflow-hidden transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
          <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">{formatTime(seconds)}</span>
        </div>
        <span className="text-[9px] md:text-[10px] text-white/95 mt-2 uppercase font-black tracking-wider text-center">সেকেন্ড (SEC)</span>
      </div>
    </div>
  );
};