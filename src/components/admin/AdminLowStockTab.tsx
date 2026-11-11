import React from 'react';
import { AlertCircle, CheckCircle, Package } from 'lucide-react';

export interface AdminLowStockTabProps {
  products: any[];
  getEffectiveStock: (p: any) => number;
}

export default function AdminLowStockTab({ products, getEffectiveStock }: AdminLowStockTabProps) {
  const lowStockProducts = products.filter((p: any) => !p.deleted && getEffectiveStock(p) <= 5);

  return (
    <div className="w-full space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl border border-yellow-100">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Low Stock Products</h3>
            <p className="text-xs text-gray-500 font-medium">
              Products with inventory level ≤ 5 units requiring replenishment
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl text-xs font-bold self-start sm:self-auto">
          {lowStockProducts.length} Items Low Stock
        </div>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-gray-400 font-bold">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-green-500" />
          <p className="text-base text-gray-600">All products have sufficient stock</p>
          <p className="text-xs text-gray-400 mt-1">No products currently at or below 5 units threshold</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockProducts
            .sort((a: any, b: any) => getEffectiveStock(a) - getEffectiveStock(b))
            .map((p: any) => {
              const effStock = getEffectiveStock(p);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-yellow-200 p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-13 h-13 rounded-xl object-cover shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                        <Package size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{p.category}</p>
                      {p.variants && p.variants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.variants.map((v: any, vi: number) => (
                            <span
                              key={vi}
                              className="text-[10px] bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium"
                            >
                              {v.name || 'Variant'}:{' '}
                              <b className={v.stock <= 0 ? 'text-red-500' : 'text-yellow-600'}>{v.stock || 0}</b>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap ${
                      effStock === 0
                        ? 'bg-red-100 text-red-600 border border-red-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    {effStock === 0 ? 'Out of Stock' : `${effStock} Left`}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
