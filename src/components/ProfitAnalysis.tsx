import React, { useMemo, useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Activity, Package, Plus, Trash2, Receipt, ShoppingCart, Edit2, X, Save, Download, ChevronDown } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Expense } from '../types';
import { formatEnglishDateTime } from '../utils/helpers';

interface ProfitAnalysisProps {
  orderHistory: any[];
  products: any[];
  expenses: Expense[];
}

export default function ProfitAnalysis({ orderHistory, products, expenses }: ProfitAnalysisProps) {
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'expenses'>('dashboard');

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setIsDownloadDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const [offlineDate, setOfflineDate] = useState('');
  const [offlineProductId, setOfflineProductId] = useState('');
  const [offlineQuantity, setOfflineQuantity] = useState(1);
  const [offlineSellPrice, setOfflineSellPrice] = useState('');
  const [offlineBuyPrice, setOfflineBuyPrice] = useState('');
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ quantity: 1, buyPrice: 0, sellPrice: 0 });

  const handleSaveEdit = async (row: any) => {
    if (!row.firebaseId) return;
    try {
      const orderRef = doc(db, "orders", row.firebaseId);
      const items = [...row.rawOrder.items];
      
      const item = items[row.itemIndex];
      item.quantity = Number(editData.quantity);
      if (!item.product) item.product = {};
      item.product.price = Number(editData.sellPrice);
      item.product.buyingPrice = Number(editData.buyPrice);
      
      if ('price' in item) item.price = Number(editData.sellPrice);
      if ('buyingPrice' in item) item.buyingPrice = Number(editData.buyPrice);

      let newTotal = 0;
      items.forEach((it: any) => {
        const qty = it.quantity || 1;
        const sellPrice = it.price || it.product?.price || 0;
        newTotal += Number(qty) * Number(sellPrice);
      });

      await updateDoc(orderRef, {
        items,
        total: newTotal,
        subtotal: newTotal
      });

      setEditingRowId(null);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order");
    }
  };

  const availablePeriods = useMemo(() => {
    const months = new Set<string>();
    const years = new Set<string>();
    
    const extractDateInfo = (dStr: any, seconds: any) => {
      if (seconds) {
        const d = new Date(seconds * 1000);
        months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        years.add(d.getFullYear().toString());
      } else if (dStr) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
          years.add(d.getFullYear().toString());
        }
      }
    };

    const validOrders = (orderHistory || []).filter(o => !o.deleted && o.status === 'delivered');
    validOrders.forEach(order => extractDateInfo(order.date, order.createdAt?.seconds));
    (expenses || []).forEach(exp => extractDateInfo(exp.date, null));

    return {
      months: Array.from(months).sort().reverse(),
      years: Array.from(years).sort().reverse()
    };
  }, [orderHistory, expenses]);

  const { tableData, filteredExpensesList, summary } = useMemo(() => {
    let totalSales = 0;
    let totalCost = 0;
    let grossProfit = 0;
    let totalItemsSold = 0;

    const data: any[] = [];

    const validOrders = (orderHistory || []).filter(o => !o.deleted && o.status === 'delivered');
    let filteredOrders = validOrders;
    let filteredExpenses = expenses || [];

    if (selectedPeriod !== 'all') {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(diffToMonday);
      startOfThisWeek.setHours(0,0,0,0);
      const endOfThisWeek = new Date(startOfThisWeek);
      endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
      endOfThisWeek.setHours(23,59,59,999);

      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
      const endOfLastWeek = new Date(endOfThisWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);

      const filterByDate = (dObj: Date | null) => {
        if (!dObj || isNaN(dObj.getTime())) return false;
        
        if (selectedPeriod === 'this_week') {
           return dObj.getTime() >= startOfThisWeek.getTime() && dObj.getTime() <= endOfThisWeek.getTime();
        } else if (selectedPeriod === 'last_week') {
           return dObj.getTime() >= startOfLastWeek.getTime() && dObj.getTime() <= endOfLastWeek.getTime();
        } else if (selectedPeriod.startsWith('year-')) {
           return dObj.getFullYear().toString() === selectedPeriod.split('-')[1];
        } else if (selectedPeriod.startsWith('month-')) {
           const [, y, m] = selectedPeriod.split('-');
           return dObj.getFullYear().toString() === y && String(dObj.getMonth() + 1).padStart(2, '0') === m;
        }
        return false;
      };
      
      filteredOrders = validOrders.filter(order => {
        let dObj = null;
        if (order.createdAt?.seconds) dObj = new Date(order.createdAt.seconds * 1000);
        else if (order.date) dObj = new Date(order.date);
        return filterByDate(dObj);
      });

      filteredExpenses = (expenses || []).filter(exp => {
        return filterByDate(exp.date ? new Date(exp.date) : null);
      });
    }

    filteredOrders.forEach(order => {
      if (!order.items) return;

      order.items.forEach((item: any, itemIndex: number) => {
        const qty = item?.quantity || 1;
        const sellPrice = item?.price || item?.product?.price || 0;
        const productId = item?.product?.id || item?.id;
        const productName = item?.product?.name || item?.name || 'Unknown';
        
        // Use order's buying price if it exists and > 0, otherwise fallback to current product's buying price
        let buyPrice = item?.product?.buyingPrice || item?.buyingPrice || 0;
        
        if (!buyPrice || buyPrice === 0) {
          let currentProduct = (products || []).find(p => p.id === productId);
          if (!currentProduct && productName !== 'Unknown') {
            currentProduct = (products || []).find(p => p.name === productName);
          }
          if (currentProduct && currentProduct.buyingPrice) {
            buyPrice = Number(currentProduct.buyingPrice);
          }
        }
        
        const itemRevenue = Number(sellPrice) * Number(qty);
        const itemCost = Number(buyPrice) * Number(qty);
        const itemProfit = itemRevenue - itemCost;

        totalSales += itemRevenue;
        totalCost += itemCost;
        grossProfit += itemProfit;
        totalItemsSold += Number(qty);

        data.push({
          firebaseId: order.id,
          itemIndex: itemIndex,
          rawOrder: order,
          orderId: order.orderId || '-',
          date: formatEnglishDateTime(order.date || order.createdAt),
          productName: productName,
          quantity: qty,
          sellPrice: Number(sellPrice),
          buyPrice: Number(buyPrice),
          profit: itemProfit,
          status: order.status
        });
      });
    });

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const netProfit = grossProfit - totalExpenses;

    return { 
      tableData: data, 
      filteredExpensesList: filteredExpenses,
      summary: { totalSales, totalCost, grossProfit, totalItemsSold, totalExpenses, netProfit } 
    };
  }, [orderHistory, products, expenses, selectedPeriod]);

  const chartData = useMemo(() => {
    const groups = {};
    
    const getRowDate = (rawOrder) => {
      if (rawOrder.createdAt?.seconds) {
        return new Date(rawOrder.createdAt.seconds * 1000);
      }
      if (rawOrder.date) {
        const d = new Date(rawOrder.date);
        if (!isNaN(d.getTime())) return d;
      }
      return new Date();
    };

    tableData.forEach(row => {
      const d = getRowDate(row.rawOrder);
      let groupKey = "";
      let label = "";
      
      if (selectedPeriod !== 'all' && !selectedPeriod.startsWith('year-')) {
        // Daily group YYYY-MM-DD
        groupKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      } else {
        // Monthly group YYYY-MM
        groupKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = { key: groupKey, dateObj: d, label, sales: 0, profit: 0 };
      }
      
      groups[groupKey].sales += row.sellPrice * row.quantity;
      groups[groupKey].profit += row.profit;
    });
    
    return (Object.values(groups) as any[]).sort((a: any, b: any) => a.key.localeCompare(b.key));
  }, [tableData, selectedPeriod]);

  const productMetrics = useMemo(() => {
    const map: Record<string, { id: string; name: string; profit: number; revenue: number; qtySold: number }> = {};
    tableData.forEach((row: any) => {
      const name = row.productName || 'Unknown Product';
      if (!map[name]) {
        map[name] = { id: name, name, profit: 0, revenue: 0, qtySold: 0 };
      }
      map[name].profit += row.profit || 0;
      map[name].revenue += (row.sellPrice * row.quantity) || 0;
      map[name].qtySold += row.quantity || 0;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [tableData]);


  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount || !expenseDate) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "expenses"), {
        description: expenseDesc,
        amount: Number(expenseAmount),
        date: expenseDate,
        createdAt: serverTimestamp()
      });
      setExpenseDesc('');
      setExpenseAmount('');
      setExpenseDate('');
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error adding expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfflineProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setOfflineProductId(pId);
    const prod = products.find(p => p.id === pId);
    if (prod) {
      setOfflineSellPrice(prod.price?.toString() || '');
      setOfflineBuyPrice(prod.buyingPrice?.toString() || '0');
    } else {
      setOfflineSellPrice('');
      setOfflineBuyPrice('');
    }
  };

  const handleAddOfflineSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineDate || !offlineProductId || !offlineSellPrice || !offlineBuyPrice) return;
    setIsSubmittingOffline(true);
    try {
      const selectedProd = products.find(p => p.id === offlineProductId);
      if (!selectedProd) throw new Error("Product not found");

      const saleDateObj = new Date(`${offlineDate}T12:00:00Z`);

      const orderId = "OFFLINE-" + Date.now().toString().slice(-6);
      const orderData = {
        orderId,
        shortId: orderId.slice(-6).toUpperCase(),
        customerName: "Offline Direct Sale",
        customerPhone: "N/A",
        address: "Offline Sale",
        paymentMethod: "cash",
        subtotal: Number(offlineSellPrice) * offlineQuantity,
        total: Number(offlineSellPrice) * offlineQuantity,
        status: "delivered",
        isOffline: true,
        createdAt: serverTimestamp(),
        date: saleDateObj.toLocaleString("en-US", { dateStyle: "short", timeStyle: "medium" }),
        items: [{
          product: {
            id: selectedProd.id,
            name: selectedProd.name,
            price: Number(offlineSellPrice),
            buyingPrice: Number(offlineBuyPrice),
            image: selectedProd.image || ""
          },
          quantity: offlineQuantity
        }]
      };

      await addDoc(collection(db, "orders"), orderData);
      
      setOfflineDate('');
      setOfflineProductId('');
      setOfflineQuantity(1);
      setOfflineSellPrice('');
      setOfflineBuyPrice('');
    } catch (error: any) {
      console.error("Error adding offline sale:", error);
      alert("Error adding offline sale: " + error.message);
    } finally {
      setIsSubmittingOffline(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteDoc(doc(db, "expenses", id));
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense.");
    }
  };

  const handleDownloadCSV = (filterType: "daily" | "weekly" | "monthly" | "selected" | "all") => {
    let targetTableData = tableData;
    let targetExpensesList = filteredExpensesList;
    let targetSummary = summary;
    let periodText = 'All Time';

    if (filterType === 'selected') {
      periodText = 'Selected Period';
      if (selectedPeriod === 'this_week') periodText = 'This Week';
      else if (selectedPeriod === 'last_week') periodText = 'Last Week';
      else if (selectedPeriod.startsWith('year-')) periodText = `Year ${selectedPeriod.split('-')[1]}`;
      else if (selectedPeriod.startsWith('month-')) {
        const [, y, mo] = selectedPeriod.split('-');
        const d = new Date(Number(y), Number(mo) - 1);
        periodText = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      }
    } else {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const filterByDate = (dObj: Date | null) => {
        if (!dObj || isNaN(dObj.getTime())) return false;
        if (filterType === 'all') return true;
        if (filterType === 'daily') return dObj >= startOfToday;
        if (filterType === 'weekly') return dObj >= sevenDaysAgo;
        if (filterType === 'monthly') return dObj >= thirtyDaysAgo;
        return false;
      };

      if (filterType === 'daily') periodText = 'Daily (Today)';
      else if (filterType === 'weekly') periodText = 'Weekly (Last 7 Days)';
      else if (filterType === 'monthly') periodText = 'Monthly (Last 30 Days)';

      const validOrders = (orderHistory || []).filter(o => o.status === 'delivered');
      const filteredOrders = validOrders.filter(order => {
        let dObj = null;
        if (order.createdAt?.seconds) dObj = new Date(order.createdAt.seconds * 1000);
        else if (order.date) dObj = new Date(order.date);
        return filterByDate(dObj);
      });

      const filteredExpenses = (expenses || []).filter(exp => {
        return filterByDate(exp.date ? new Date(exp.date) : null);
      });

      let totalSales = 0;
      let totalCost = 0;
      let grossProfit = 0;
      let totalItemsSold = 0;

      const data: any[] = [];

      filteredOrders.forEach(order => {
        if (!order.items) return;

        order.items.forEach((item: any, itemIndex: number) => {
          const qty = item?.quantity || 1;
          const sellPrice = item?.price || item?.product?.price || 0;
          const productId = item?.product?.id || item?.id;
          const productName = item?.product?.name || item?.name || 'Unknown';
          
          let buyPrice = item?.product?.buyingPrice || item?.buyingPrice || 0;
          
          if (!buyPrice || buyPrice === 0) {
            let currentProduct = (products || []).find(p => p.id === productId);
            if (!currentProduct && productName !== 'Unknown') {
              currentProduct = (products || []).find(p => p.name === productName);
            }
            if (currentProduct && currentProduct.buyingPrice) {
              buyPrice = Number(currentProduct.buyingPrice);
            }
          }
          
          const itemRevenue = Number(sellPrice) * Number(qty);
          const itemCost = Number(buyPrice) * Number(qty);
          const itemProfit = itemRevenue - itemCost;

          totalSales += itemRevenue;
          totalCost += itemCost;
          grossProfit += itemProfit;
          totalItemsSold += Number(qty);

          data.push({
            date: formatEnglishDateTime(order.date || order.createdAt),
            orderId: order.orderId || '-',
            productName: productName,
            quantity: qty,
            sellPrice: Number(sellPrice),
            buyPrice: Number(buyPrice),
            profit: itemProfit,
            status: order.status
          });
        });
      });

      const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const netProfit = grossProfit - totalExpenses;

      targetTableData = data;
      targetExpensesList = filteredExpenses;
      targetSummary = { totalSales, totalCost, grossProfit, totalItemsSold, totalExpenses, netProfit };
    }

    let csvContent = "\uFEFF"; // UTF-8 BOM

    // 1. Summary Section
    csvContent += "Report Summary\n";
    csvContent += `Period:, ${periodText}\n`;
    csvContent += `Total Sales:, ৳${targetSummary.totalSales}\n`;
    csvContent += `Product Cost:, ৳${targetSummary.totalCost}\n`;
    csvContent += `Gross Profit:, ৳${targetSummary.grossProfit}\n`;
    csvContent += `Total Expenses:, ৳${targetSummary.totalExpenses}\n`;
    csvContent += `Net Profit:, ৳${targetSummary.netProfit}\n`;
    csvContent += "\n";

    // 2. Income/Orders Section
    csvContent += "Orders & Revenue\n";
    csvContent += "Date,Order ID,Product,Quantity,Cost,Revenue,Profit,Status\n";
    targetTableData.forEach(row => {
      const prodName = `"${row.productName.replace(/"/g, '""')}"`;
      csvContent += `${row.date},${row.orderId},${prodName},${row.quantity},${row.buyPrice * row.quantity},${row.sellPrice * row.quantity},${row.profit},${row.status}\n`;
    });
    csvContent += "\n";

    // 3. Expenses Section
    csvContent += "Expenses\n";
    csvContent += "Date,Description,Amount\n";
    targetExpensesList.forEach(exp => {
      const desc = exp.description ? `"${exp.description.replace(/"/g, '""')}"` : "";
      const date = exp.date ? new Date(exp.date).toLocaleDateString('en-US') : "";
      csvContent += `${date},${desc},${exp.amount}\n`;
    });

    // Create and Download Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Income_Expense_Report_${filterType}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Actions Bar: Month Selector & Export */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="font-bold text-gray-700 whitespace-nowrap">Select Time Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full md:w-auto p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 font-bold bg-gray-50 text-gray-800 outline-none"
            >
              <option value="all">All Time</option>
              <optgroup label="Weekly">
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
              </optgroup>
              <optgroup label="Monthly">
                {availablePeriods.months.map(m => {
                  const [y, mo] = m.split('-');
                  const date = new Date(Number(y), Number(mo) - 1);
                  const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                  return <option key={`month-${m}`} value={`month-${m}`}>{monthName}</option>;
                })}
              </optgroup>
              <optgroup label="Yearly">
                {availablePeriods.years.map(y => (
                  <option key={`year-${y}`} value={`year-${y}`}>Year {y}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="relative w-full md:w-auto" ref={downloadDropdownRef}>
            <button
              onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
              className="w-full md:w-auto px-5 py-2.5 bg-[#107c41] text-white font-bold rounded-xl hover:bg-[#0c5e31] transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[#107c41]/20 active:scale-95 cursor-pointer"
            >
              <Download size={18} /> Download Excel <ChevronDown size={14} />
            </button>
            {isDownloadDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-[999] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    handleDownloadCSV('daily');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download size={14} /> Today's Report
                </button>
                <button
                  onClick={() => {
                    handleDownloadCSV('weekly');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download size={14} /> Last 7 Days Report
                </button>
                <button
                  onClick={() => {
                    handleDownloadCSV('monthly');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download size={14} /> Last 30 Days Report
                </button>
                <button
                  onClick={() => {
                    handleDownloadCSV('selected');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 border-t border-gray-50 pt-2.5 mt-1 cursor-pointer"
                >
                  <Download size={14} /> Selected Period Report
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    handleDownloadCSV('all');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download size={14} /> All Time Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Header Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Product Buying Cost</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalCost.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Gross Profit</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.grossProfit.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Other Expenses</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-200 flex items-center gap-4 ring-2 ring-indigo-50">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-600 uppercase">Net Profit</p>
              <p className="text-2xl font-bold text-indigo-900">৳{summary.netProfit.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Items Sold</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalItemsSold.toLocaleString()} pcs</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 my-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Activity size={18} /> Graphical Dashboard
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'orders' ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Package size={18} /> Order & Profit Breakdown
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'expenses' ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Receipt size={18} /> Expenses & Offline Sales
          </button>
        </div>


        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Sales and Profit Trend Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" size={20} /> Sales & Profit Trend
              </h3>
              
              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 font-bold">
                  No data available for the selected period
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px] h-[320px] relative mt-4">
                    <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
                      {/* Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = 30 + ratio * 200;
                        const maxVal = Math.max(...chartData.map(d => d.sales), 1000);
                        const val = Math.round(maxVal * (1 - ratio));
                        return (
                          <g key={idx} className="opacity-30">
                            <line x1="60" y1={y} x2="760" y2={y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
                            <text x="50" y={y + 4} textAnchor="end" className="text-[10px] font-bold fill-gray-500">
                              ৳{val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}
                            </text>
                          </g>
                        );
                      })}

                      {/* X Axis Labels */}
                      {chartData.map((d, idx) => {
                        const x = 80 + (idx * (680 / Math.max(chartData.length - 1, 1)));
                        return (
                          <text key={idx} x={x} y="260" textAnchor="middle" className="text-[10px] font-bold fill-gray-400">
                            {d.label}
                          </text>
                        );
                      })}

                      {/* Sales Bar Chart */}
                      {chartData.map((d, idx) => {
                        const maxVal = Math.max(...chartData.map(d => d.sales), 1000);
                        const x = 80 + (idx * (680 / Math.max(chartData.length - 1, 1)));
                        const barHeight = (d.sales / maxVal) * 200;
                        const y = 230 - barHeight;
                        
                        return (
                          <g key={`sales-${idx}`} className="group cursor-pointer">
                            <rect 
                              x={x - 12} 
                              y={y} 
                              width="10" 
                              height={barHeight} 
                              fill="#818cf8" 
                              rx="2"
                              className="transition-all duration-300 hover:fill-indigo-600" 
                            />
                            <title>Sales: ৳{d.sales.toLocaleString()}</title>
                          </g>
                        );
                      })}

                      {/* Profit Bar Chart */}
                      {chartData.map((d, idx) => {
                        const maxVal = Math.max(...chartData.map(d => d.sales), 1000);
                        const x = 80 + (idx * (680 / Math.max(chartData.length - 1, 1)));
                        const barHeight = (d.profit / maxVal) * 200;
                        const y = 230 - barHeight;
                        
                        return (
                          <g key={`profit-${idx}`} className="group cursor-pointer">
                            <rect 
                              x={x + 2} 
                              y={y} 
                              width="10" 
                              height={Math.max(barHeight, 0)} 
                              fill="#34d399" 
                              rx="2"
                              className="transition-all duration-300 hover:fill-green-600" 
                            />
                            <title>Profit: ৳{d.profit.toLocaleString()}</title>
                          </g>
                        );
                      })}

                      {/* Connecting Line Chart for Profit */}
                      {(() => {
                        const maxVal = Math.max(...chartData.map(d => d.sales), 1000);
                        const points = chartData.map((d, idx) => {
                          const x = 80 + (idx * (680 / Math.max(chartData.length - 1, 1)));
                          const y = 230 - (d.profit / maxVal) * 200;
                          return `${x},${y}`;
                        }).join(' ');

                        return (
                          <polyline 
                            fill="none" 
                            stroke="#059669" 
                            strokeWidth="2.5" 
                            points={points} 
                            className="drop-shadow-sm"
                          />
                        );
                      })()}

                      {/* Markers on Profit Line */}
                      {chartData.map((d, idx) => {
                        const maxVal = Math.max(...chartData.map(d => d.sales), 1000);
                        const x = 80 + (idx * (680 / Math.max(chartData.length - 1, 1)));
                        const y = 230 - (d.profit / maxVal) * 200;
                        
                        return (
                          <g key={`marker-${idx}`} className="group cursor-pointer">
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="4" 
                              fill="#059669" 
                              stroke="#ffffff" 
                              strokeWidth="1.5"
                              className="transition-all duration-300 hover:r-6" 
                            />
                            <title>Profit: ৳{d.profit.toLocaleString()}</title>
                          </g>
                        );
                      })}
                    </svg>
                    
                    {/* Legend */}
                    <div className="flex justify-center items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-indigo-400 rounded-md"></div>
                        <span className="text-xs font-bold text-gray-600">Total Sales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-md"></div>
                        <span className="text-xs font-bold text-gray-600">Gross Profit</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top Products Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-600" /> Top Selling Products by Profit
                </h3>
                
                {productMetrics.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-400 font-bold">
                    No sales data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productMetrics.slice(0, 5).map((p, idx) => {
                      const maxProfit = Math.max(...productMetrics.map(x => x.profit), 1);
                      const widthPercent = (p.profit / maxProfit) * 100;
                      
                      return (
                        <div key={p.id || idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-800 truncate max-w-[200px]">{idx + 1}. {p.name}</span>
                            <span className="text-green-600 font-black">৳{p.profit.toLocaleString()} Profit</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${widthPercent}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap shrink-0">
                              {p.qtySold} sold
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="text-blue-600" /> Sales Share by Product
                </h3>
                
                {productMetrics.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-400 font-bold">
                    No sales data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productMetrics.slice(0, 5).map((p, idx) => {
                      const maxRevenue = Math.max(...productMetrics.map(x => x.revenue), 1);
                      const widthPercent = (p.revenue / maxRevenue) * 100;
                      
                      return (
                        <div key={p.id || idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-800 truncate max-w-[200px]">{idx + 1}. {p.name}</span>
                            <span className="text-indigo-600 font-black">৳{p.revenue.toLocaleString()} Sales</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${widthPercent}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap shrink-0">
                              ৳{p.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Expenses & Offline Sales Section */}
        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="text-red-500" size={20} /> Add New Expense
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g. Packaging, Office Rent, Staff Salary"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Adding...' : <><Plus size={18} /> Add Expense</>}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="text-indigo-500" size={20} /> Add Direct Offline Sale
            </h3>
            <form onSubmit={handleAddOfflineSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" required value={offlineDate} onChange={(e) => setOfflineDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select required value={offlineProductId} onChange={handleOfflineProductChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" required min="1" value={offlineQuantity} onChange={(e) => setOfflineQuantity(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buying Price (৳)</label>
                  <input type="number" required min="0" value={offlineBuyPrice} onChange={(e) => setOfflineBuyPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (৳)</label>
                  <input type="number" required min="0" value={offlineSellPrice} onChange={(e) => setOfflineSellPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <button type="submit" disabled={isSubmittingOffline} className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer">
                {isSubmittingOffline ? 'Adding...' : <><Plus size={18} /> Add Offline Sale</>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1 xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity className="text-gray-500" size={18} /> Expense Records
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-bold">Date</th>
                    <th className="px-6 py-3 font-bold">Description</th>
                    <th className="px-6 py-3 font-bold text-right">Amount (৳)</th>
                    <th className="px-6 py-3 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(filteredExpensesList || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        No expense records found
                      </td>
                    </tr>
                  ) : (
                    [...(filteredExpensesList || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((exp) => (
                      <tr key={exp.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">{exp?.date ? new Date(exp.date).toLocaleDateString('en-US') : ''}</td>
                        <td className="px-6 py-3">{exp?.description || ''}</td>
                        <td className="px-6 py-3 text-right font-bold text-red-600">{(exp?.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => exp?.id && handleDeleteExpense(exp.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        {/* Excel-like Table for Sales */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-indigo-50 flex items-center justify-between">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
              <Package size={18} /> Order & Profit Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-3 font-bold whitespace-nowrap">Date</th>
                  <th className="px-3 py-3 font-bold whitespace-nowrap">Order ID</th>
                  <th className="px-3 py-3 font-bold">Product Name</th>
                  <th className="px-3 py-3 font-bold text-center whitespace-nowrap">Quantity</th>
                  <th className="px-3 py-3 font-bold text-right whitespace-nowrap">Buy Price (৳)</th>
                  <th className="px-3 py-3 font-bold text-right whitespace-nowrap">Sell Price (৳)</th>
                  <th className="px-3 py-3 font-bold text-right whitespace-nowrap">Profit (৳)</th>
                  <th className="px-3 py-3 font-bold text-center whitespace-nowrap">Status</th>
                  <th className="px-3 py-3 font-bold text-center min-w-[120px] whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                      No delivered orders found
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, idx) => {
                    const rowId = `${row.firebaseId}-${row.itemIndex}`;
                    const isEditing = editingRowId === rowId;

                    return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap">{row.date}</td>
                      <td className="px-3 py-3 font-medium text-gray-900">
                        <span className="font-black text-indigo-600 block">
                          #{String(row.orderId).slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                          {row.orderId}
                        </span>
                      </td>
                      <td className="px-3 py-3 min-w-[150px]">{row.productName}</td>
                      <td className="px-3 py-3 text-center">
                        {isEditing ? (
                          <input type="number" min="1" className="w-16 p-1 border border-indigo-300 rounded text-center focus:ring-2 focus:ring-indigo-500" value={editData.quantity} onChange={e => setEditData({...editData, quantity: Number(e.target.value)})} />
                        ) : row.quantity}
                      </td>
                      <td className="px-3 py-3 text-right text-orange-600 whitespace-nowrap">
                        {isEditing ? (
                          <input type="number" min="0" className="w-20 p-1 border border-indigo-300 rounded text-right focus:ring-2 focus:ring-indigo-500" value={editData.buyPrice} onChange={e => setEditData({...editData, buyPrice: Number(e.target.value)})} title="Unit Buy Price" />
                        ) : (row.buyPrice * row.quantity).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right text-blue-600 whitespace-nowrap">
                        {isEditing ? (
                          <input type="number" min="0" className="w-20 p-1 border border-indigo-300 rounded text-right focus:ring-2 focus:ring-indigo-500" value={editData.sellPrice} onChange={e => setEditData({...editData, sellPrice: Number(e.target.value)})} title="Unit Sell Price" />
                        ) : (row.sellPrice * row.quantity).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-green-600 whitespace-nowrap">
                        {isEditing ? (
                          ((editData.sellPrice - editData.buyPrice) * editData.quantity).toLocaleString()
                        ) : row.profit.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${row.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSaveEdit(row)} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors cursor-pointer" title="Save"><Save size={16} /></button>
                              <button onClick={() => setEditingRowId(null)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer" title="Cancel"><X size={16} /></button>
                            </>
                          ) : (
                            <button onClick={() => {
                              setEditingRowId(rowId);
                              setEditData({ quantity: row.quantity, buyPrice: row.buyPrice, sellPrice: row.sellPrice });
                            }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit row">
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
