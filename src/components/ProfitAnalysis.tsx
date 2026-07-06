import React, { useMemo, useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Activity, Package, Plus, Trash2, Receipt, ShoppingCart, Edit2, X, Save, Download, ChevronDown } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Expense } from '../types';

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

    const validOrders = (orderHistory || []).filter(o => o.status === 'delivered');
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

    const validOrders = (orderHistory || []).filter(o => o.status === 'delivered');
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
          date: order.date || new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString(),
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

      const orderData = {
        orderId: "OFFLINE-" + Date.now().toString().slice(-6),
        customerName: "অফলাইন সেলস",
        customerPhone: "N/A",
        address: "অফলাইন সেলস",
        paymentMethod: "cash",
        subtotal: Number(offlineSellPrice) * offlineQuantity,
        total: Number(offlineSellPrice) * offlineQuantity,
        status: "delivered",
        isOffline: true,
        createdAt: serverTimestamp(),
        date: saleDateObj.toLocaleString("bn-BD"),
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
    if (!window.confirm("আপনি কি নিশ্চিত যে এই খরচটি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, "expenses", id));
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("খরচ ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  const handleDownloadCSV = (filterType: "daily" | "weekly" | "monthly" | "selected" | "all") => {
    let targetTableData = tableData;
    let targetExpensesList = filteredExpensesList;
    let targetSummary = summary;
    let periodText = 'সব সময় (All Time)';

    if (filterType === 'selected') {
      periodText = 'নির্বাচিত সময়কাল (Selected Period)';
      if (selectedPeriod === 'this_week') periodText = 'চলতি সপ্তাহ (This Week)';
      else if (selectedPeriod === 'last_week') periodText = 'গত সপ্তাহ (Last Week)';
      else if (selectedPeriod.startsWith('year-')) periodText = `${selectedPeriod.split('-')[1]} সাল (Yearly)`;
      else if (selectedPeriod.startsWith('month-')) {
        const [, y, mo] = selectedPeriod.split('-');
        const d = new Date(Number(y), Number(mo) - 1);
        periodText = d.toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
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

      if (filterType === 'daily') periodText = 'আজকের রিপোর্ট (Daily)';
      else if (filterType === 'weekly') periodText = 'গত ৭ দিনের রিপোর্ট (Weekly)';
      else if (filterType === 'monthly') periodText = 'গত ৩০ দিনের রিপোর্ট (Monthly)';

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
            date: order.date || new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString(),
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

    let csvContent = "\uFEFF"; // UTF-8 BOM for Bengali support in Excel

    // 1. Summary Section
    csvContent += "রিপোর্ট সারসংক্ষেপ\n";
    csvContent += `সময়কাল:, ${periodText}\n`;
    csvContent += `মোট বিক্রয়:, ৳${targetSummary.totalSales}\n`;
    csvContent += `প্রোডাক্ট ক্রয়মূল্য:, ৳${targetSummary.totalCost}\n`;
    csvContent += `গ্রোস প্রফিট:, ৳${targetSummary.grossProfit}\n`;
    csvContent += `মোট খরচ:, ৳${targetSummary.totalExpenses}\n`;
    csvContent += `নেট প্রফিট:, ৳${targetSummary.netProfit}\n`;
    csvContent += "\n";

    // 2. Income/Orders Section
    csvContent += "অর্ডার ও আয়সমূহ\n";
    csvContent += "তারিখ,অর্ডার আইডি,প্রোডাক্ট,পরিমাণ,ক্রয়মূল্য,বিক্রয়মূল্য,প্রফিট,স্ট্যাটাস\n";
    targetTableData.forEach(row => {
      const prodName = `"${row.productName.replace(/"/g, '""')}"`;
      csvContent += `${row.date},${row.orderId},${prodName},${row.quantity},${row.buyPrice * row.quantity},${row.sellPrice * row.quantity},${row.profit},${row.status}\n`;
    });
    csvContent += "\n";

    // 3. Expenses Section
    csvContent += "খরচসমূহ\n";
    csvContent += "তারিখ,বিবরণ,পরিমাণ\n";
    targetExpensesList.forEach(exp => {
      const desc = exp.description ? `"${exp.description.replace(/"/g, '""')}"` : "";
      const date = exp.date ? new Date(exp.date).toLocaleDateString('bn-BD') : "";
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
            <label className="font-bold text-gray-700 whitespace-nowrap">সময়কাল সিলেক্ট করুন:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full md:w-auto p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 font-bold bg-gray-50 text-gray-800 outline-none"
            >
              <option value="all">সব সময় (All Time)</option>
              <optgroup label="সাপ্তাহিক (Weekly)">
                <option value="this_week">চলতি সপ্তাহ (This Week)</option>
                <option value="last_week">গত সপ্তাহ (Last Week)</option>
              </optgroup>
              <optgroup label="মাসিক (Monthly)">
                {availablePeriods.months.map(m => {
                  const [y, mo] = m.split('-');
                  const date = new Date(Number(y), Number(mo) - 1);
                  const monthName = date.toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
                  return <option key={`month-${m}`} value={`month-${m}`}>{monthName}</option>;
                })}
              </optgroup>
              <optgroup label="বাৎসরিক (Yearly)">
                {availablePeriods.years.map(y => (
                  <option key={`year-${y}`} value={`year-${y}`}>{y} সাল</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="relative w-full md:w-auto" ref={downloadDropdownRef}>
            <button
              onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
              className="w-full md:w-auto px-5 py-2.5 bg-[#107c41] text-white font-bold rounded-xl hover:bg-[#0c5e31] transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[#107c41]/20 active:scale-95"
            >
              <Download size={18} /> এক্সেল ডাউনলোড করুন <ChevronDown size={14} />
            </button>
            {isDownloadDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-[999] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    handleDownloadCSV('daily');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> আজকের রিপোর্ট
                </button>
                <button
                  onClick={() => {
                    handleDownloadCSV('weekly');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> গত ৭ দিনের রিপোর্ট
                </button>
                <button
                  onClick={() => {
                    handleDownloadCSV('monthly');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> গত ৩০ দিনের রিপোর্ট
                </button>
                <button
                  onClick={() => {
                    handleDownloadCSV('selected');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 border-t border-gray-50 pt-2.5 mt-1"
                >
                  <Download size={14} /> নির্বাচিত সময়কালের রিপোর্ট
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    handleDownloadCSV('all');
                    setIsDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> সব সময়ের রিপোর্ট
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
              <p className="text-sm font-bold text-gray-500 uppercase">মোট বিক্রয়</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">প্রোডাক্ট ক্রয়মূল্য</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalCost.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">গ্রোস প্রফিট</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.grossProfit.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">অন্যান্য খরচ</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-200 flex items-center gap-4 ring-2 ring-indigo-50">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-600 uppercase">নেট প্রফিট</p>
              <p className="text-2xl font-bold text-indigo-900">৳{summary.netProfit.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">সর্বমোট প্রোডাক্ট সেল</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalItemsSold.toLocaleString()} টি</p>
            </div>
          </div>
        </div>

        {/* Expenses & Offline Sales Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="text-red-500" size={20} /> খরচ যুক্ত করুন
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">খরচের বিবরণ</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="যেমন: প্যাকেজিং, স্টাফ বেতন"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
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
                className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'যুক্ত হচ্ছে...' : <><Plus size={18} /> খরচ যুক্ত করুন</>}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="text-indigo-500" size={20} /> অফলাইন সেলস যুক্ত করুন
            </h3>
            <form onSubmit={handleAddOfflineSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
                <input type="date" required value={offlineDate} onChange={(e) => setOfflineDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রোডাক্ট</label>
                <select required value={offlineProductId} onChange={handleOfflineProductChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">প্রোডাক্ট সিলেক্ট করুন</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ</label>
                  <input type="number" required min="1" value={offlineQuantity} onChange={(e) => setOfflineQuantity(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ক্রয়মূল্য (৳)</label>
                  <input type="number" required min="0" value={offlineBuyPrice} onChange={(e) => setOfflineBuyPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিক্রয়মূল্য (৳)</label>
                  <input type="number" required min="0" value={offlineSellPrice} onChange={(e) => setOfflineSellPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <button type="submit" disabled={isSubmittingOffline} className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {isSubmittingOffline ? 'যুক্ত হচ্ছে...' : <><Plus size={18} /> অফলাইন সেলস যুক্ত করুন</>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1 xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity className="text-gray-500" size={18} /> খরচের তালিকা
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-bold">তারিখ</th>
                    <th className="px-6 py-3 font-bold">বিবরণ</th>
                    <th className="px-6 py-3 font-bold text-right">পরিমাণ (৳)</th>
                    <th className="px-6 py-3 font-bold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(filteredExpensesList || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        কোনো খরচের রেকর্ড নেই
                      </td>
                    </tr>
                  ) : (
                    [...(filteredExpensesList || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((exp) => (
                      <tr key={exp.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">{exp?.date ? new Date(exp.date).toLocaleDateString() : ''}</td>
                        <td className="px-6 py-3">{exp?.description || ''}</td>
                        <td className="px-6 py-3 text-right font-bold text-red-600">{(exp?.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => exp?.id && handleDeleteExpense(exp.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="ডিলিট করুন"
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

        {/* Excel-like Table for Sales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-indigo-50 flex items-center justify-between">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
              <Package size={18} /> অর্ডার ও প্রফিট তালিকা
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-3 font-bold whitespace-nowrap">তারিখ</th>
                  <th className="px-3 py-3 font-bold whitespace-nowrap">অর্ডার আইডি</th>
                  <th className="px-3 py-3 font-bold">প্রোডাক্টের নাম</th>
                  <th className="px-3 py-3 font-bold text-center whitespace-nowrap">পরিমাণ</th>
                  <th className="px-3 py-3 font-bold text-right whitespace-nowrap">ক্রয়মূল্য (৳)</th>
                  <th className="px-3 py-3 font-bold text-right whitespace-nowrap">বিক্রয়মূল্য (৳)</th>
                  <th className="px-3 py-3 font-bold text-right whitespace-nowrap">প্রফিট (৳)</th>
                  <th className="px-3 py-3 font-bold text-center whitespace-nowrap">স্ট্যাটাস</th>
                  <th className="px-3 py-3 font-bold text-center min-w-[120px] whitespace-nowrap">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                      কোনো ডেলিভারড অর্ডার পাওয়া যায়নি
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
                              <button onClick={() => handleSaveEdit(row)} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Save"><Save size={16} /></button>
                              <button onClick={() => setEditingRowId(null)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Cancel"><X size={16} /></button>
                            </>
                          ) : (
                            <button onClick={() => {
                              setEditingRowId(rowId);
                              setEditData({ quantity: row.quantity, buyPrice: row.buyPrice, sellPrice: row.sellPrice });
                            }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit row">
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
      </div>
    </div>
  );
}
