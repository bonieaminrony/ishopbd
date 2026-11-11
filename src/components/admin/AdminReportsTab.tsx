import React, { useState } from 'react';
import { Activity, DollarSign, Layers, Package, Search, Tag, TrendingUp, X } from 'lucide-react';

export interface AdminReportsTabProps {
  orderHistory: any[];
  products: any[];
  getEffectiveStock: (p: any) => number;
}

export default function AdminReportsTab({ orderHistory, products, getEffectiveStock }: AdminReportsTabProps) {
  const [reportProductPeriod, setReportProductPeriod] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all');
  const [selectedReportProductId, setSelectedReportProductId] = useState<string | null>(null);
  const [reportProductSearch, setReportProductSearch] = useState('');

  const activeOrders = (orderHistory || []).filter((o: any) => !o.deleted);
  const filteredOrders = activeOrders.filter((o: any) => {
    if (reportProductPeriod === 'all') return true;
    const dateVal = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.date || o.createdAt;
    if (!dateVal) return false;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    if (reportProductPeriod === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (reportProductPeriod === 'last_month') {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    } else if (reportProductPeriod === 'this_year') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalOrdersCount = filteredOrders.length;
  const deliveredOrders = filteredOrders.filter((o: any) => o.status === 'delivered');
  const deliveredOrdersCount = deliveredOrders.length;
  const pendingOrdersCount = filteredOrders.filter(
    (o: any) =>
      o.status === 'pending' || o.status === 'processing' || o.status === 'confirmed' || o.status === 'shipped'
  ).length;
  const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

  const allProductMetrics = (products || [])
    .filter((p: any) => !p.deleted)
    .map((p: any) => {
      const buyingPrice = Number(p.buyingPrice || 0);
      const sellingPrice = Number(p.price || 0);
      const currentStock = getEffectiveStock(p);

      let soldUnits = 0;
      let revenue = 0;
      let cost = 0;
      let pendingUnits = 0;
      let cancelledUnits = 0;
      const matchingOrders: any[] = [];

      filteredOrders.forEach((o: any) => {
        let matchedInOrder = false;
        let orderItemQty = 0;
        let orderItemPrice = 0;

        (o.items || []).forEach((item: any) => {
          const isMatch =
            item.id === p.id || item.product?.id === p.id || item.name === p.name || item.product?.name === p.name;
          if (isMatch) {
            matchedInOrder = true;
            const qty = Number(item.quantity || item.qty || 1);
            const itemSellPrice = Number(item.price || item.product?.price || sellingPrice || 0);
            const itemBuyPrice = Number(item.buyingPrice || item.product?.buyingPrice || buyingPrice || 0);

            orderItemQty += qty;
            orderItemPrice = itemSellPrice;

            if (o.status === 'delivered') {
              soldUnits += qty;
              revenue += itemSellPrice * qty;
              cost += itemBuyPrice * qty;
            } else if (
              o.status === 'pending' ||
              o.status === 'processing' ||
              o.status === 'confirmed' ||
              o.status === 'shipped'
            ) {
              pendingUnits += qty;
            } else if (o.status === 'cancelled' || o.status === 'returned') {
              cancelledUnits += qty;
            }
          }
        });

        if (matchedInOrder) {
          matchingOrders.push({
            ...o,
            productQty: orderItemQty,
            productPrice: orderItemPrice,
          });
        }
      });

      const profit = revenue - cost;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
      const inventoryCost = currentStock * buyingPrice;
      const inventoryValue = currentStock * sellingPrice;

      return {
        product: p,
        id: p.id,
        name: p.name,
        image: p.image || p.images?.[0] || '',
        category: p.category || 'General',
        sellingPrice,
        buyingPrice,
        stock: currentStock,
        soldUnits,
        revenue,
        cost,
        profit,
        margin,
        pendingUnits,
        cancelledUnits,
        inventoryCost,
        inventoryValue,
        matchingOrders: matchingOrders.sort((a, b) => {
          const aT = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.date ? new Date(a.date).getTime() : 0;
          const bT = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.date ? new Date(b.date).getTime() : 0;
          return bT - aT;
        }),
      };
    });

  const selectedProduct = selectedReportProductId
    ? allProductMetrics.find((p) => p.id === selectedReportProductId)
    : null;

  const searchResults = reportProductSearch.trim()
    ? allProductMetrics.filter(
        (p) =>
          p.name.toLowerCase().includes(reportProductSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(reportProductSearch.toLowerCase()) ||
          (p.id && p.id.toLowerCase().includes(reportProductSearch.toLowerCase()))
      )
    : [];

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-md shadow-orange-500/20">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Reports &amp; Analytics</h3>
            <p className="text-xs text-gray-500 font-bold">Product-wise Revenue, Cost, Profit &amp; Stock Analytics</p>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 self-start md:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'this_year', label: 'This Year' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportProductPeriod(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                reportProductPeriod === tab.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Store Overview Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-xs font-bold text-blue-600">Total Orders</span>
          <span className="text-2xl font-black text-blue-900">{totalOrdersCount}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-xs font-bold text-emerald-600">Delivered Orders</span>
          <span className="text-2xl font-black text-emerald-900">{deliveredOrdersCount}</span>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-xs font-bold text-amber-600">Pending / Processing</span>
          <span className="text-2xl font-black text-amber-900">{pendingOrdersCount}</span>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-xs font-bold text-purple-600">Total Revenue</span>
          <span className="text-2xl font-black text-purple-900">৳{totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Product Search & Selector Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Search className="text-primary" size={18} /> Search Product &amp; View Profit/Loss Report
            </h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Search and select any product to inspect its individual revenue, buying cost, net profit, and stock
            </p>
          </div>
          {selectedProduct && (
            <button
              onClick={() => {
                setSelectedReportProductId(null);
                setReportProductSearch('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors self-start sm:self-auto"
            >
              <X size={14} /> Clear Filter
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={reportProductSearch}
            onChange={(e) => setReportProductSearch(e.target.value)}
            placeholder="Search product by name, category or SKU (e.g. Handheld Fan, Power Bank)..."
            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent outline-none transition-all"
          />
          {reportProductSearch && (
            <button
              onClick={() => setReportProductSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {reportProductSearch.trim() && (
          <div className="border border-gray-100 rounded-xl bg-gray-50/60 p-2 max-h-60 overflow-y-auto divide-y divide-gray-100">
            {searchResults.length === 0 ? (
              <p className="text-center py-4 text-xs text-gray-400 font-bold">No matching products found</p>
            ) : (
              searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedReportProductId(p.id);
                    setReportProductSearch('');
                  }}
                  className={`p-2.5 rounded-lg flex items-center justify-between gap-3 hover:bg-white cursor-pointer transition-all ${
                    selectedReportProductId === p.id ? 'bg-white ring-1 ring-primary shadow-xs' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-500">
                        Sell: <span className="font-bold text-gray-800">৳{p.sellingPrice}</span> | Buy:{' '}
                        <span className="font-bold text-gray-800">৳{p.buyingPrice}</span> | Stock:{' '}
                        <span className={`font-black ${p.stock <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {p.stock} Units
                        </span>
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold shrink-0">
                    Select
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Product Deep Report */}
      {selectedProduct ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-primary/20 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-gray-50 border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Package size={24} className="text-gray-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-primary/10 text-primary">
                      {selectedProduct.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        selectedProduct.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : selectedProduct.stock <= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {selectedProduct.stock === 0
                        ? '🔴 Out of Stock'
                        : selectedProduct.stock <= 5
                        ? `🟡 Low Stock (${selectedProduct.stock} Left)`
                        : `🟢 In Stock (${selectedProduct.stock} Units)`}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mt-1 truncate">{selectedProduct.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">
                    Selling Price: <span className="font-bold text-gray-900">৳{selectedProduct.sellingPrice.toLocaleString()}</span> |{' '}
                    Buying Price: <span className="font-bold text-gray-900">৳{selectedProduct.buyingPrice.toLocaleString()}</span> |{' '}
                    Est. Profit/Unit:{' '}
                    <span className="font-bold text-emerald-600">
                      ৳{(selectedProduct.sellingPrice - selectedProduct.buyingPrice).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReportProductId(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors shrink-0"
              >
                Change Product
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Total Sales Revenue</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <DollarSign size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-blue-600">৳{selectedProduct.revenue.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400 font-bold mt-0.5">From {selectedProduct.soldUnits} sold units</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Total Buying Cost (COGS)</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Tag size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-600">৳{selectedProduct.cost.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400 font-bold mt-0.5">Cost of sold inventory</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 p-5 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800">Gross Profit (Net Gain)</span>
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600">৳{selectedProduct.profit.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Profit Margin: {selectedProduct.margin}%</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Stock Remaining &amp; Asset Value</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Package size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-purple-600">{selectedProduct.stock} Units Left</p>
                <p className="text-[11px] text-gray-500 font-bold mt-0.5">
                  Inventory Cost: ৳{selectedProduct.inventoryCost.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[11px] text-gray-500 font-bold">✅ Delivered Units</p>
              <p className="text-lg font-black text-gray-900 mt-0.5">{selectedProduct.soldUnits} Units</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[11px] text-gray-500 font-bold">⏳ Pending / Processing</p>
              <p className="text-lg font-black text-amber-600 mt-0.5">{selectedProduct.pendingUnits} Units</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[11px] text-gray-500 font-bold">❌ Cancelled / Returned</p>
              <p className="text-lg font-black text-red-600 mt-0.5">{selectedProduct.cancelledUnits} Units</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[11px] text-gray-500 font-bold">🏢 Potential Stock Revenue</p>
              <p className="text-lg font-black text-primary mt-0.5">৳{selectedProduct.inventoryValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Recent Customer Orders for this Product</h4>
                <p className="text-xs text-gray-400 font-medium">
                  List of customer orders containing this specific product
                </p>
              </div>
              <span className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {selectedProduct.matchingOrders.length} Total Orders
              </span>
            </div>

            {selectedProduct.matchingOrders.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-xs font-bold">
                No orders recorded for this product in selected timeframe
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer Name &amp; Phone</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-center">Quantity</th>
                      <th className="p-3.5 text-right">Amount</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {selectedProduct.matchingOrders.slice(0, 15).map((o: any) => (
                      <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary">#{String(o.id).slice(-6).toUpperCase()}</td>
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{o.customerName || 'Customer'}</span>
                            <span className="text-gray-400 font-mono">{o.customerPhone || o.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-500 whitespace-nowrap">
                          {o.date || (o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : '-')}
                        </td>
                        <td className="p-3.5 text-center font-bold text-gray-800">{o.productQty || 1}</td>
                        <td className="p-3.5 text-right font-black text-gray-900">
                          ৳{((o.productPrice || selectedProduct.sellingPrice) * (o.productQty || 1)).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              o.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : o.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : o.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-700'
                                : o.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* All Products Performance Summary Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Layers className="text-orange-500" size={18} /> All Products Financial &amp; Stock Summary
            </h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Click 'View Report' on any product to see complete profit, cost, and order breakdown
            </p>
          </div>
          <span className="text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-xl self-start sm:self-auto">
            {allProductMetrics.length} Total Products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider">
                <th className="p-3.5">Product</th>
                <th className="p-3.5 text-right">Buying Price</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-center">Current Stock</th>
                <th className="p-3.5 text-center">Sold Units</th>
                <th className="p-3.5 text-right">Total Revenue</th>
                <th className="p-3.5 text-right">Total Cost</th>
                <th className="p-3.5 text-right">Net Profit</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {allProductMetrics
                .sort((a, b) => b.soldUnits - a.soldUnits || b.profit - a.profit)
                .map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-orange-50/30 transition-colors ${
                      selectedReportProductId === p.id ? 'bg-orange-50/50' : ''
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-3 min-w-[200px] max-w-xs">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-white border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-xs truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-700">৳{p.buyingPrice.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-gray-900">৳{p.sellingPrice.toLocaleString()}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          p.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : p.stock <= 5
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.stock === 0 ? '0 Units' : `${p.stock} Units`}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-black text-gray-900">{p.soldUnits}</td>
                    <td className="p-3.5 text-right font-bold text-blue-700">৳{p.revenue.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-amber-700">৳{p.cost.toLocaleString()}</td>
                    <td className="p-3.5 text-right">
                      <span
                        className={`font-black ${
                          p.profit > 0 ? 'text-emerald-600' : p.profit < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}
                      >
                        ৳{p.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedReportProductId(p.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          selectedReportProductId === p.id
                            ? 'bg-orange-500 text-white shadow-orange-500/20'
                            : 'bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700'
                        }`}
                      >
                        {selectedReportProductId === p.id ? 'Selected' : 'View Report'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
