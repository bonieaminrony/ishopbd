import React from 'react';

export const ProductSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full animate-pulse">
    <div className="relative aspect-square bg-gray-200 dark:bg-slate-700" />
    <div className="p-3 flex flex-col flex-1 gap-2">
      <div className="w-1/3 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
      <div className="w-full h-5 bg-gray-200 dark:bg-slate-700 rounded mt-1" />
      <div className="w-2/3 h-5 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
      <div className="mt-auto flex items-end justify-between">
        <div className="w-1/2 h-6 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="w-full h-10 bg-gray-200 dark:bg-slate-700 rounded-lg mt-2" />
    </div>
  </div>
);
