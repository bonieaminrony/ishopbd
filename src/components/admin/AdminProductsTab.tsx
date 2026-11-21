import React from 'react';
import {
  Activity,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Copy,
  Edit3,
  Eye,
  Filter,
  Hash,
  ImageIcon,
  LayoutTemplate,
  List,
  MoreVertical,
  Package,
  Plus,
  PlusCircle,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductPath } from '../../utils/helpers';

export interface AdminProductsTabProps {
  editingProduct: any;
  setEditingProduct: React.Dispatch<React.SetStateAction<any>>;
  saveProduct: (e: React.FormEvent) => void;
  productFormErrors: any;
  setProductFormErrors: React.Dispatch<React.SetStateAction<any>>;
  isMasterAdmin: boolean;
  handleAdminImageUpload: (e: React.ChangeEvent<HTMLInputElement>, target?: any) => void;
  handleSetPrimaryImage?: (idx: number) => void;
  removeImage: (idx: number) => void;
  handleAdminMultiImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categories: any[];
  handleVariantImageUpload: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  removeVariant: (idx: number) => void;
  addVariant: () => void;
  products: any[];
  getEffectiveStock: (p: any) => number;
  togglePublishStatus: (p: any) => void;
  activeProductDropdown: string | null;
  productDropdownRef: React.RefObject<HTMLDivElement>;
  setActiveProductDropdown: (id: string | null) => void;
  copyLandingPageLink: (id: string) => void;
  handleDuplicateProduct: (p: any) => void;
  openLandingEditor: (p: any) => void;
  deleteProduct: (id: string) => void;
}

export default function AdminProductsTab({
  editingProduct,
  setEditingProduct,
  saveProduct,
  productFormErrors,
  setProductFormErrors,
  isMasterAdmin,
  handleAdminImageUpload,
  handleSetPrimaryImage,
  removeImage,
  handleAdminMultiImageUpload,
  categories,
  handleVariantImageUpload,
  removeVariant,
  addVariant,
  products,
  getEffectiveStock,
  togglePublishStatus,
  activeProductDropdown,
  productDropdownRef,
  setActiveProductDropdown,
  copyLandingPageLink,
  handleDuplicateProduct,
  openLandingEditor,
  deleteProduct,
}: AdminProductsTabProps) {
  const [isGeneratingTags, setIsGeneratingTags] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState('all');
  const [previewMode, setPreviewMode] = React.useState<'card' | 'details'>('card');
  const [previewActiveImageIdx, setPreviewActiveImageIdx] = React.useState(0);

  // Collect all preview images
  const previewImages = React.useMemo(() => {
    const list: string[] = [];
    if (editingProduct?.image) list.push(editingProduct.image);
    if (Array.isArray(editingProduct?.images)) {
      editingProduct.images.forEach((img: string) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (Array.isArray(editingProduct?.variants)) {
      editingProduct.variants.forEach((v: any) => {
        if (v?.image && !list.includes(v.image)) list.push(v.image);
      });
    }
    return list.length > 0 ? list : ['/logo.webp'];
  }, [editingProduct]);

  // Reset active image index when images change
  React.useEffect(() => {
    setPreviewActiveImageIdx(0);
  }, [editingProduct?.id, editingProduct?.image]);

  // Discount %
  const discountPercent = React.useMemo(() => {
    const p = Number(editingProduct?.price || 0);
    const op = Number(editingProduct?.originalPrice || 0);
    if (op > p && op > 0) {
      return Math.round(((op - p) / op) * 100);
    }
    return 0;
  }, [editingProduct?.price, editingProduct?.originalPrice]);

  // Latest products first + Search by Code, Name, Category, ID
  const sortedAndFilteredProducts = React.useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      const getTime = (item: any) => {
        if (!item) return 0;
        if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
        if (item.createdAt?.toMillis) return item.createdAt.toMillis();
        if (item.updatedAt?.seconds) return item.updatedAt.seconds * 1000;
        if (item.updatedAt?.toMillis) return item.updatedAt.toMillis();
        if (item.createdAt) {
          const d = new Date(item.createdAt).getTime();
          if (!isNaN(d)) return d;
        }
        if (item.updatedAt) {
          const d = new Date(item.updatedAt).getTime();
          if (!isNaN(d)) return d;
        }
        return 0;
      };
      const timeA = getTime(a);
      const timeB = getTime(b);
      if (timeA !== timeB) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

    return sorted.filter((p) => {
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = p.code ? String(p.code).toLowerCase().includes(q) : false;
      const nameMatch = p.name ? String(p.name).toLowerCase().includes(q) : false;
      const catMatch = p.category ? String(p.category).toLowerCase().includes(q) : false;
      const idMatch = p.id ? String(p.id).toLowerCase().includes(q) : false;
      const brandMatch = p.brand ? String(p.brand).toLowerCase().includes(q) : false;
      return codeMatch || nameMatch || catMatch || idMatch || brandMatch;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  const handleGenerateAiTags = async (count: number = 30) => {
    const name = editingProduct?.name?.trim();
    if (!name) {
      toast.error('Please enter the Product Name first!');
      const el = document.getElementById('field-name');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setIsGeneratingTags(true);
      toast.loading(`Generating ${count} AI search tags...`);
      const res = await fetch('/api/generate-product-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: editingProduct?.category || '',
          subcategory: editingProduct?.subcategory || '',
          brand: editingProduct?.brand || '',
          description: editingProduct?.description || '',
          count,
        }),
      });

      const data = await res.json();
      toast.dismiss();

      if (data.success && Array.isArray(data.tags) && data.tags.length > 0) {
        const existingArr = editingProduct?.tags
          ? editingProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [];

        const combined = Array.from(new Set([...existingArr, ...data.tags])).join(', ');
        setEditingProduct((prev: any) => ({
          ...(prev || {}),
          tags: combined,
        }));
        toast.success(`Successfully added ${data.tags.length} AI tags!`);
      } else {
        toast.error('Could not generate tags. Please try again.');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Could not connect to server.');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Grid: Form on Left (7 cols) & Live Preview on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add/Edit Form */}
        <div className="lg:col-span-7">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-0">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-secondary flex items-center gap-2">
              <PlusCircle size={20} className="text-primary" />
              {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
            </h4>
            {editingProduct && (
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
          <form
            onSubmit={saveProduct}
            className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 no-scrollbar"
          >
            {/* Step 1: Name & Code */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-sm font-bold text-gray-700">Product Name &amp; Code</span>
              </div>
              <div className="p-4 space-y-3">
                <div id="field-name">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                    <span>Product Full Name</span>
                    {productFormErrors.name ? (
                      <span className="text-red-500 normal-case font-normal">Name is required</span>
                    ) : (
                      <span className="text-red-400 normal-case font-normal">* Required</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editingProduct?.name || ''}
                    onChange={(e) => {
                      setEditingProduct({ ...(editingProduct || {}), name: e.target.value } as any);
                      if (productFormErrors.name) setProductFormErrors((prev: any) => ({ ...prev, name: false }));
                    }}
                    className={`w-full bg-gray-50 border ${
                      productFormErrors.name ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                    } rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-semibold transition-all`}
                    placeholder="e.g., Samsung Galaxy A55 5G (8GB/128GB)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div id="field-code">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                      <span>Product Code</span>
                      <span className="text-red-400 normal-case font-normal">* Required</span>
                    </label>
                    <input
                      type="text"
                      value={editingProduct?.code || ''}
                      onChange={(e) => {
                        setEditingProduct({ ...(editingProduct || {}), code: e.target.value } as any);
                        if (productFormErrors.code) setProductFormErrors((prev: any) => ({ ...prev, code: false }));
                      }}
                      className={`w-full bg-gray-50 border ${
                        productFormErrors.code ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                      } rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-bold transition-all`}
                      placeholder="e.g., SAM-A55"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Used for searching</p>
                  </div>
                  <div id="field-sms-name">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                      SMS Name <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={editingProduct?.smsName || ''}
                      onChange={(e) => setEditingProduct({ ...(editingProduct || {}), smsName: e.target.value } as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-bold transition-all"
                      placeholder="e.g., Galaxy A55"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Short name for SMS</p>
                  </div>
                </div>

                <div id="field-slug" className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase">
                      SEO URL Slug <span className="text-gray-400 normal-case font-normal">(Optional / Auto-generated)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editingProduct?.slug || ''}
                    onChange={(e) => setEditingProduct({ ...(editingProduct || {}), slug: e.target.value } as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-xs font-mono font-semibold transition-all"
                    placeholder="e.g., samsung-galaxy-a55-5g"
                  />
                  {editingProduct && (
                    <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-hidden text-[11px] text-blue-700 font-mono">
                        <span className="shrink-0 font-bold">🌐 Short URL:</span>
                        <span className="truncate">{getProductPath(editingProduct)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}${getProductPath(editingProduct)}`;
                          navigator.clipboard.writeText(url);
                          toast.success('Short Product URL copied to clipboard!');
                        }}
                        className="shrink-0 text-[10px] font-bold bg-white hover:bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs transition-all"
                      >
                        Copy URL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Price & Stock */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="text-sm font-bold text-gray-700">Price &amp; Stock</span>
              </div>
              <div className="p-4 space-y-3">
                <div className={`grid gap-3 ${isMasterAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {isMasterAdmin && (
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-500 uppercase mb-1">Buying Price 🔒</label>
                      <input
                        type="number"
                        value={editingProduct?.buyingPrice || ''}
                        onChange={(e) =>
                          setEditingProduct((prev: any) => ({ ...(prev || {}), buyingPrice: Number(e.target.value) }))
                        }
                        className="w-full bg-indigo-50 border border-indigo-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm font-bold text-indigo-900 transition-all"
                        placeholder="0"
                      />
                    </div>
                  )}
                  <div id="field-price">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                      <span>
                        Selling Price <span className="text-red-400">*</span>
                      </span>
                      {productFormErrors.price && (
                        <span className="text-red-500 normal-case font-normal">Price required</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={editingProduct?.price || ''}
                      onChange={(e) => {
                        setEditingProduct((prev: any) => ({ ...(prev || {}), price: Number(e.target.value) }));
                        if (productFormErrors.price) setProductFormErrors((prev: any) => ({ ...prev, price: false }));
                      }}
                      className={`w-full bg-gray-50 border ${
                        productFormErrors.price ? 'border-red-400 ring-2 ring-red-400/20' : 'border-gray-200'
                      } rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-bold transition-all`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                      Old Price <span className="text-gray-400 font-normal normal-case">(For discount)</span>
                    </label>
                    <input
                      type="number"
                      value={editingProduct?.originalPrice || ''}
                      onChange={(e) =>
                        setEditingProduct((prev: any) => ({ ...(prev || {}), originalPrice: Number(e.target.value) }))
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Weight</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct?.weight || ''}
                      onChange={(e) =>
                        setEditingProduct((prev: any) => ({
                          ...(prev || {}),
                          weight: e.target.value === '' ? 0 : Number(e.target.value),
                        }))
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Unit</label>
                    <select
                      value={editingProduct?.unit || 'piece'}
                      onChange={(e) => setEditingProduct((prev: any) => ({ ...(prev || {}), unit: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all cursor-pointer"
                    >
                      <option value="piece">Piece</option>
                      <option value="kg">KG</option>
                      <option value="gm">Gram</option>
                      <option value="liter">Liter</option>
                      <option value="ml">ML</option>
                      <option value="packet">Packet</option>
                      <option value="box">Box</option>
                      <option value="set">Set</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Stock</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editingProduct?.stock === undefined || editingProduct?.stock === null ? '' : editingProduct.stock}
                        onChange={(e) =>
                          setEditingProduct((prev: any) => ({
                            ...(prev || {}),
                            stock: e.target.value === '' ? 0 : Number(e.target.value),
                          }))
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                        {(() => {
                          switch (editingProduct?.unit) {
                            case 'kg':
                              return 'Kg';
                            case 'gm':
                              return 'Gm';
                            case 'liter':
                              return 'Ltr';
                            case 'ml':
                              return 'Ml';
                            case 'packet':
                              return 'Pkt';
                            case 'box':
                              return 'Box';
                            case 'set':
                              return 'Set';
                            default:
                              return 'Pcs';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Images */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="text-sm font-bold text-gray-700">Images</span>
              </div>
              <div className="p-4 space-y-3">
                <div id="field-image">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                    <span>Main Image</span>
                    {productFormErrors.image ? (
                      <span className="text-red-500 normal-case font-normal">Image is required</span>
                    ) : (
                      <span className="text-red-400 normal-case font-normal">* Required</span>
                    )}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingProduct?.image || ''}
                      onChange={(e) => {
                        setEditingProduct((prev: any) => ({ ...(prev || {}), image: e.target.value }));
                        if (productFormErrors.image) setProductFormErrors((prev: any) => ({ ...prev, image: false }));
                      }}
                      className={`w-full bg-gray-50 border ${
                        productFormErrors.image ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                      } rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-xs transition-all`}
                      placeholder="Paste image link (https://...)"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-[10px] text-gray-400 font-bold">OR</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <input
                      key={editingProduct?.image || 'empty'}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleAdminImageUpload(e);
                        if (productFormErrors.image) setProductFormErrors((prev: any) => ({ ...prev, image: false }));
                      }}
                      className="hidden"
                      id="adminImageUpload"
                    />
                    <label
                      htmlFor="adminImageUpload"
                      className="w-full bg-gray-50 text-gray-600 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 hover:border-primary/30 hover:bg-red-50/30 transition-all"
                    >
                      <Upload size={14} /> Upload image from computer
                    </label>
                    {editingProduct?.image && (
                      <div className="relative w-24 h-24 group rounded-xl overflow-hidden border-2 border-primary/40 shadow-sm">
                        <img loading="lazy" src={editingProduct.image} className="w-full h-full object-cover" alt="Primary Preview" />
                        <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                          <Star size={9} className="fill-current" /> Main
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProduct((prev: any) => ({ ...(prev || {}), image: '' }))}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                    Additional Images <span className="text-gray-400 font-normal normal-case">(Gallery)</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {editingProduct?.images?.map((img: string, idx: number) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img loading="lazy" src={img} className="w-full h-full object-cover" alt={`Gallery ${idx + 1}`} />
                        {handleSetPrimaryImage && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            title="Set as Main Image"
                            className="absolute bottom-0 inset-x-0 bg-black/75 hover:bg-primary text-white text-[8px] font-bold py-1 flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Star size={8} className="fill-current" /> Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full shadow hover:bg-red-600 transition-colors z-10"
                        >
                          <X size={9} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-red-50/20 transition-all">
                      <PlusCircle size={18} className="text-gray-300" />
                      <span className="text-[8px] font-bold text-gray-300 mt-0.5">Add</span>
                      <input
                        key={editingProduct?.images?.length || 0}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleAdminMultiImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Category & Tags */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  4
                </span>
                <span className="text-sm font-bold text-gray-700">Category &amp; Tags</span>
              </div>
              <div className="p-4 space-y-3">
                <div id="field-category">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                    <span>Category</span>
                    {productFormErrors.category ? (
                      <span className="text-red-500 normal-case font-normal">Select Category</span>
                    ) : (
                      <span className="text-red-400 normal-case font-normal">* Required</span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={editingProduct?.category || ''}
                      onChange={(e) => {
                        setEditingProduct((prev: any) => ({ ...(prev || {}), category: e.target.value, subcategory: '' }));
                        if (productFormErrors.category) setProductFormErrors((prev: any) => ({ ...prev, category: false }));
                      }}
                      className={`appearance-none w-full bg-gray-50 border ${
                        productFormErrors.category ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                      } rounded-xl py-2.5 pl-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold cursor-pointer`}
                    >
                      <option value="">— Select Category —</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
                {(() => {
                  const selCatObj = categories.find((c) => c.name === editingProduct?.category);
                  const subcats = selCatObj?.subcategories || [];
                  if (subcats.length === 0) return null;
                  return (
                    <div id="field-subcategory">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Sub-Category</label>
                      <div className="relative">
                        <select
                          value={editingProduct?.subcategory || ''}
                          onChange={(e) =>
                            setEditingProduct((prev: any) => ({ ...(prev || {}), subcategory: e.target.value }))
                          }
                          className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold cursor-pointer"
                        >
                          <option value="">— Select Sub-Category —</option>
                          {subcats.map((sub: string, idx: number) => (
                            <option key={idx} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                  );
                })()}
                <div id="field-tags">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                      <span>Search Tags</span>
                      {editingProduct?.tags && editingProduct.tags.trim() && (
                        <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.2 rounded-full">
                          {editingProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean).length} Tags
                        </span>
                      )}
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-semibold hidden sm:inline mr-0.5">AI Generate:</span>
                      {[20, 30, 50].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          disabled={isGeneratingTags}
                          onClick={() => handleGenerateAiTags(cnt)}
                          className="text-[10px] bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 font-bold px-2 py-0.5 rounded-lg border border-indigo-200/80 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                          title={`Generate ${cnt} relevant search tags with AI`}
                        >
                          <Sparkles size={11} className="text-indigo-600 animate-pulse" />
                          <span>{cnt} Tags</span>
                        </button>
                      ))}
                      {editingProduct?.tags && editingProduct.tags.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to clear all tags?')) {
                              setEditingProduct((prev: any) => ({ ...(prev || {}), tags: '' }));
                            }
                          }}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold px-1.5 py-0.5 rounded-lg hover:bg-red-50 transition-colors ml-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 min-h-[46px] flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    {(editingProduct?.tags
                      ? editingProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                      : []
                    ).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 bg-gray-800 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-lg"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const arr = editingProduct?.tags
                              ? editingProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                              : [];
                            setEditingProduct((prev: any) => ({
                              ...(prev || {}),
                              tags: arr.filter((_: string, i: number) => i !== idx).join(', '),
                            }));
                          }}
                          className="hover:text-white transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="flex-1 bg-transparent outline-none text-sm min-w-[120px] px-1 py-0.5 font-medium text-gray-700"
                      placeholder={
                        !editingProduct?.tags || editingProduct.tags.trim() === ''
                          ? 'e.g., smartwatch, watch — Press Enter or comma to add'
                          : 'More tags...'
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = e.currentTarget.value;
                          if (val.trim()) {
                            const arr = editingProduct?.tags
                              ? editingProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                              : [];
                            const combined = Array.from(
                              new Set([...arr, ...val.split(',').map((t) => t.trim()).filter(Boolean)])
                            ).join(', ');
                            setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.currentTarget.value;
                        if (val.trim()) {
                          const arr = editingProduct?.tags
                            ? editingProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                            : [];
                          const combined = Array.from(
                            new Set([...arr, ...val.split(',').map((t) => t.trim()).filter(Boolean)])
                          ).join(', ');
                          setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined }));
                          e.currentTarget.value = '';
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const paste = e.clipboardData.getData('text');
                        if (paste.trim()) {
                          const arr = editingProduct?.tags
                            ? editingProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                            : [];
                          const combined = Array.from(
                            new Set([...arr, ...paste.split(',').map((t) => t.trim()).filter(Boolean)])
                          ).join(', ');
                          setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Size & Color */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    5
                  </span>
                  <span className="text-sm font-bold text-gray-700">Size &amp; Color (Variants)</span>
                </div>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Optional</span>
              </div>
              <div className="p-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
                  <p className="text-[11px] font-bold text-blue-600 mb-1">📌 Instructions:</p>
                  <p className="text-[11px] text-blue-500">
                    • If no size, enter <strong>"Free"</strong> in Size
                  </p>
                  <p className="text-[11px] text-blue-500">• Provide separate stock (Quantity) for each variant</p>
                </div>
                <div className="space-y-3">
                  {editingProduct?.variants?.map((variant: any, idx: number) => (
                    <div
                      key={variant.id || idx}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-3 relative group hover:border-gray-300 transition-all"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="w-14 h-14 flex-shrink-0 relative">
                          {variant.image ? (
                            <img loading="lazy" src={variant.image} className="w-14 h-14 rounded-xl object-cover border border-gray-200" alt="Variant" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 bg-white">
                              <ImageIcon size={18} />
                            </div>
                          )}
                          <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/20 rounded-xl transition-all">
                            <Upload size={12} className="text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleVariantImageUpload(e, idx)}
                            />
                          </label>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Color</label>
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev: any) => {
                                  const nv = [...(prev?.variants || [])];
                                  if (nv[idx]) nv[idx] = { ...nv[idx], name: val };
                                  return { ...prev, variants: nv };
                                });
                              }}
                              placeholder="Red"
                              className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-primary uppercase">Size *</label>
                            <input
                              type="text"
                              value={variant.size || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev: any) => {
                                  const nv = [...(prev?.variants || [])];
                                  if (nv[idx]) nv[idx] = { ...nv[idx], size: val };
                                  return { ...prev, variants: nv };
                                });
                              }}
                              placeholder="XL / Free"
                              className="w-full bg-red-50 border border-primary/20 rounded-lg py-1.5 px-2 text-xs font-bold text-primary outline-none focus:ring-1 focus:ring-primary mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-emerald-600 uppercase">Stock (Qty)</label>
                            <input
                              type="number"
                              value={variant.stock === undefined || variant.stock === null ? '' : variant.stock}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                setEditingProduct((prev: any) => {
                                  if (!prev) return prev;
                                  const nv = [...(prev.variants || [])];
                                  if (nv[idx]) nv[idx] = { ...nv[idx], stock: val };
                                  return { ...prev, variants: nv };
                                });
                              }}
                              placeholder="0"
                              className="w-full bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-2 text-xs font-bold text-emerald-700 outline-none focus:ring-1 focus:ring-emerald-500 mt-0.5"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <div className="flex gap-1">
                          {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                setEditingProduct((prev: any) => {
                                  const nv = [...(prev?.variants || [])];
                                  if (nv[idx]) nv[idx] = { ...nv[idx], size: s };
                                  return { ...prev, variants: nv };
                                })
                              }
                              className={`text-[8px] px-1.5 py-0.5 rounded border font-bold transition-all ${
                                variant.size === s
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-gray-400 border-gray-200 hover:border-primary/30'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingProduct((prev: any) => {
                                if (!prev) return prev;
                                const nv = [...(prev.variants || [])];
                                const toClone = nv[idx];
                                if (toClone)
                                  nv.push({ ...toClone, id: Math.random().toString(36).substring(2, 9) });
                                return { ...prev, variants: nv };
                              })
                            }
                            className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                            title="Action"
                          >
                            <Copy size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="p-1 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-all"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-2 hover:border-primary/30 hover:text-primary hover:bg-red-50/20 transition-all"
                  >
                    <Plus size={16} /> Add New Size or Color Variant
                  </button>
                </div>
              </div>
            </div>

            {/* Step 6: Product Details & Specifications */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    6
                  </span>
                  <span className="text-sm font-bold text-gray-700">Product Specifications &amp; Details</span>
                </div>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Optional</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Brand</label>
                    <input
                      type="text"
                      value={editingProduct?.brand || ''}
                      onChange={(e) => setEditingProduct((prev: any) => ({ ...(prev || {}), brand: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                      placeholder="Samsung, Apple, Awei..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Model</label>
                    <input
                      type="text"
                      value={editingProduct?.modelName || ''}
                      onChange={(e) => setEditingProduct((prev: any) => ({ ...(prev || {}), modelName: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                      placeholder="Galaxy A55"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Warranty</label>
                    <input
                      type="text"
                      value={editingProduct?.warranty || ''}
                      onChange={(e) => setEditingProduct((prev: any) => ({ ...(prev || {}), warranty: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                      placeholder="e.g., 1 Year Official Warranty"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">In the Box</label>
                    <input
                      type="text"
                      value={editingProduct?.inTheBox || ''}
                      onChange={(e) => setEditingProduct((prev: any) => ({ ...(prev || {}), inTheBox: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                      placeholder="e.g., 1x Device, 1x Cable, User Manual"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase">Description</label>
                    <button
                      type="button"
                      onClick={async () => {
                        const name = editingProduct?.name;
                        if (!name) {
                          toast.error('Please enter a product name first!');
                          return;
                        }
                        try {
                          toast.loading('Generating AI description...');
                          const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              message: `Write an engaging product description for a product named "${name}". Highlight its features and make it appealing. Format nicely in English.`,
                              messages: [
                                {
                                  role: 'user',
                                  content: `Write an engaging product description for a product named "${name}". Highlight its features and make it appealing. Format nicely in English.`,
                                },
                              ],
                            }),
                          });
                          const data = await response.json();
                          const desc = data.reply || data.text || '';
                          if (desc) {
                            setEditingProduct((prev: any) => (prev ? { ...prev, description: desc } : null));
                            toast.dismiss();
                            toast.success('Description generated successfully!');
                          } else {
                            toast.dismiss();
                            toast.error('Failed to generate description with Gemini.');
                          }
                        } catch (err) {
                          toast.dismiss();
                          toast.error('Server is not responding.');
                        }
                      }}
                      className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 active:scale-95 border border-indigo-100 font-sans cursor-pointer"
                    >
                      <Activity size={10} /> Generate AI Description
                    </button>
                  </div>
                  <textarea
                    value={editingProduct?.description || ''}
                    onChange={(e) =>
                      setEditingProduct((prev: any) => ({ ...(prev || {}), description: e.target.value }))
                    }
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-xs font-medium no-scrollbar transition-all resize-none"
                    placeholder="Write detailed product description here..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                    Key Features <span className="text-gray-400 font-normal normal-case">— One per line</span>
                  </label>
                  <textarea
                    value={editingProduct?.features || ''}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...(prev || {}), features: e.target.value }))}
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-xs font-medium no-scrollbar leading-relaxed transition-all resize-none"
                    placeholder={'Bluetooth 5.3\n5000mAh Long Battery\nType-C Fast Charging'}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">YouTube Video URL</label>
                  <input
                    type="text"
                    value={editingProduct?.videoUrl || ''}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...(prev || {}), videoUrl: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-xs transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                {/* Specifications */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <label className="block text-[11px] font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                    <List size={13} /> Technical Specifications
                  </label>
                  <div className="space-y-2">
                    {(editingProduct?.specifications || []).map((spec: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center bg-white rounded-lg border border-blue-100 p-2">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => {
                            const val = e.target.value;
                            const ns = [...(editingProduct?.specifications || [])];
                            ns[idx].key = val;
                            setEditingProduct((prev: any) => ({ ...(prev || {}), specifications: ns }));
                          }}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="e.g., Battery"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            const ns = [...(editingProduct?.specifications || [])];
                            ns[idx].value = val;
                            setEditingProduct((prev: any) => ({ ...(prev || {}), specifications: ns }));
                          }}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="e.g., 5000mAh"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct((prev: any) => ({
                              ...(prev || {}),
                              specifications: editingProduct?.specifications?.filter((_: any, i: number) => i !== idx),
                            }))
                          }
                          className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct((prev: any) => ({
                          ...(prev || {}),
                          specifications: [...(editingProduct?.specifications || []), { key: '', value: '' }],
                        }))
                      }
                      className="w-full py-2 border-2 border-dashed border-blue-200 rounded-xl text-blue-500 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-all"
                    >
                      <Plus size={13} /> + Add Specification Row
                    </button>
                  </div>
                </div>

                {/* Wholesale Pricing */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <label className="block text-[11px] font-bold text-amber-600 uppercase mb-2 flex items-center gap-1">
                    <Tag size={13} /> Wholesale Pricing Tiers
                  </label>
                  <div className="space-y-2">
                    {editingProduct?.wholesaleTiers?.map((tier: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-end bg-white rounded-lg border border-amber-100 p-2">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Min Quantity</label>
                          <input
                            type="number"
                            value={tier.minQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const nt = [...(editingProduct?.wholesaleTiers || [])];
                              nt[idx].minQty = val;
                              setEditingProduct((prev: any) => ({ ...(prev || {}), wholesaleTiers: nt }));
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-amber-400 mt-0.5"
                            placeholder="10"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Price (per unit)</label>
                          <input
                            type="number"
                            value={tier.price}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const nt = [...(editingProduct?.wholesaleTiers || [])];
                              nt[idx].price = val;
                              setEditingProduct((prev: any) => ({ ...(prev || {}), wholesaleTiers: nt }));
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-amber-400 mt-0.5"
                            placeholder="150"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct((prev: any) => ({
                              ...(prev || {}),
                              wholesaleTiers: editingProduct?.wholesaleTiers?.filter((_: any, i: number) => i !== idx),
                            }))
                          }
                          className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-all mb-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct((prev: any) => ({
                          ...(prev || {}),
                          wholesaleTiers: [
                            ...(editingProduct?.wholesaleTiers || []),
                            { minQty: 10, price: Number(editingProduct?.price || 0) },
                          ],
                        }))
                      }
                      className="w-full py-2 border-2 border-dashed border-amber-200 rounded-xl text-amber-600 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-all"
                    >
                      <Plus size={13} /> + Add Wholesale Tier
                    </button>
                    <p className="text-[10px] text-amber-500 text-center">* e.g., 10 pcs @ ৳150 each, 20 pcs @ ৳140 each.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 7: Publishing Options */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  7
                </span>
                <span className="text-sm font-bold text-gray-700">Publishing Options</span>
              </div>
              <div className="p-3 space-y-1">
                <label htmlFor="isPublishedCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                  <input
                    type="checkbox"
                    id="isPublishedCheck"
                    checked={editingProduct?.isPublished !== false}
                    onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isPublished: e.target.checked } as any)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    ✅ Published — Visible on website
                  </span>
                </label>
                <label htmlFor="isTrendingCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                  <input
                    type="checkbox"
                    id="isTrendingCheck"
                    checked={editingProduct?.isTrending || false}
                    onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isTrending: e.target.checked } as any)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    🔥 Show in Trending Section
                  </span>
                </label>
                <label htmlFor="isFreeDeliveryCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                  <input
                    type="checkbox"
                    id="isFreeDeliveryCheck"
                    checked={editingProduct?.isFreeDelivery || false}
                    onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isFreeDelivery: e.target.checked } as any)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    🚚 Free Delivery
                  </span>
                </label>
                <div className="py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-50/70 mt-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
                    <span>📦 Custom Delivery Fee (Optional)</span>
                    <span className="text-[10px] text-gray-500 font-normal">Nationwide Flat Rate</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct?.deliveryCharge ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                        setEditingProduct((prev: any) => ({
                          ...(prev || {}),
                          deliveryCharge: val,
                        }));
                      }}
                      placeholder="Leave empty for standard rates (৳70/৳130), or enter custom fee (e.g. 50, 60, 100)"
                      className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-7 pr-3 outline-none focus:ring-2 focus:ring-primary/30 text-xs font-bold transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-gray-500 font-bold mr-0.5">Quick Select:</span>
                    {[50, 60, 80, 100, 120].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setEditingProduct((prev: any) => ({
                            ...(prev || {}),
                            deliveryCharge: amt,
                            isFreeDelivery: false,
                          }));
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                          editingProduct?.deliveryCharge === amt
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-red-50/30'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                    {(editingProduct?.deliveryCharge !== undefined && editingProduct?.deliveryCharge !== null && editingProduct?.deliveryCharge !== '') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct((prev: any) => {
                            const updated = { ...(prev || {}) };
                            delete updated.deliveryCharge;
                            return updated;
                          });
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                      >
                        Remove (Standard Rate)
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    * If set (e.g. 50, 60 or 100 BDT), this flat fee applies nationwide regardless of delivery location.
                  </p>
                </div>
                <label htmlFor="isComingSoonCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                  <input
                    type="checkbox"
                    id="isComingSoonCheck"
                    checked={editingProduct?.isComingSoon || false}
                    onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isComingSoon: e.target.checked } as any)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    ⏳ Coming Soon (Pre-Order)
                  </span>
                </label>
                <label htmlFor="isFlashSaleCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                  <input
                    type="checkbox"
                    id="isFlashSaleCheck"
                    checked={editingProduct?.isFlashSale || false}
                    onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isFlashSale: e.target.checked } as any)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    ⚡ Flash Sale
                  </span>
                </label>
                {editingProduct?.isFlashSale && (
                  <div className="px-3 pb-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Flash Sale End Time</label>
                    <input
                      type="datetime-local"
                      value={editingProduct.flashSaleEndDate || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...(editingProduct || {}), flashSaleEndDate: e.target.value } as any)
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                    />
                  </div>
                )}
                <label htmlFor="showSizeGuideCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                  <input
                    type="checkbox"
                    id="showSizeGuideCheck"
                    checked={editingProduct?.showSizeGuide || false}
                    onChange={(e) => setEditingProduct({ ...(editingProduct || {}), showSizeGuide: e.target.checked } as any)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1.5">
                      👕 Clothing Size Guide & Recommender
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Show size chart and height/weight calculator for apparel and jackets
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 8: Frequently Bought Together (Bundle / Combo Offer) */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    8
                  </span>
                  <span className="text-sm font-bold text-slate-900">Combo Offer / Bundle</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {(editingProduct?.bundleProductIds || []).length} Selected
                </span>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-500 font-medium">
                  Select complementary products to display as a "Frequently Bought Together" bundle on this product page.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                    Add Related Product to Bundle
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;
                      const currentList = editingProduct?.bundleProductIds || [];
                      if (!currentList.includes(selectedId)) {
                        setEditingProduct((prev: any) => ({
                          ...(prev || {}),
                          bundleProductIds: [...currentList, selectedId],
                        }));
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary/30 text-xs font-bold transition-all"
                  >
                    <option value="">-- Select a product to add to bundle --</option>
                    {(products || [])
                      .filter(
                        (p: any) =>
                          p.id !== editingProduct?.id &&
                          !p.deleted &&
                          !(editingProduct?.bundleProductIds || []).includes(p.id)
                      )
                      .map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (৳{p.price}) {p.code ? `[Code: ${p.code}]` : ''}
                        </option>
                      ))}
                  </select>
                </div>

                {(editingProduct?.bundleProductIds || []).length > 0 && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Selected Bundle Items:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(editingProduct?.bundleProductIds || []).map((bId: string) => {
                        const bProduct = (products || []).find((p: any) => p.id === bId);
                        if (!bProduct) {
                          return (
                            <div
                              key={bId}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs"
                            >
                              <span className="text-gray-400 italic">Product ID: {bId} (Not Found or Deleted)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct((prev: any) => ({
                                    ...(prev || {}),
                                    bundleProductIds: (prev?.bundleProductIds || []).filter((id: string) => id !== bId),
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={bId}
                            className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"
                          >
                            <img
                              src={bProduct.image || bProduct.images?.[0] || '/logo.png'}
                              alt={bProduct.name}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{bProduct.name}</p>
                              <p className="text-[11px] font-extrabold text-primary">
                                ৳{bProduct.price}{' '}
                                {bProduct.code && <span className="text-[10px] text-gray-400 font-normal">({bProduct.code})</span>}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct((prev: any) => ({
                                  ...(prev || {}),
                                  bundleProductIds: (prev?.bundleProductIds || []).filter((id: string) => id !== bId),
                                }));
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove from bundle"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Bundle Discount (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct?.bundleDiscount ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setEditingProduct((prev: any) => ({
                          ...(prev || {}),
                          bundleDiscount: val,
                        }));
                      }}
                      placeholder="e.g., 10 (0 for no discount)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary/30 text-xs font-bold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Discount Type</label>
                    <select
                      value={editingProduct?.bundleDiscountType || 'percentage'}
                      onChange={(e) => {
                        setEditingProduct((prev: any) => ({
                          ...(prev || {}),
                          bundleDiscountType: e.target.value as 'percentage' | 'fixed',
                        }));
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary/30 text-xs font-bold transition-all"
                    >
                      <option value="percentage">% Percentage Off (e.g. 10%)</option>
                      <option value="fixed">৳ Flat Discount (e.g. ৳100)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-2 pb-4">
              <button
                type="submit"
                className="flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-red-700 active:scale-95 transition-all text-sm"
              >
                {editingProduct?.id ? '✏️ Update Product' : '✅ Save Product'}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-100 text-gray-500 px-5 rounded-2xl hover:bg-gray-200 transition-all font-bold text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Live Product Preview */}
      <div className="lg:col-span-5 sticky top-4 space-y-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          {/* Header with Switcher */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-sm font-bold text-secondary flex items-center gap-1.5">
                <Eye size={16} className="text-primary" />
                Live Preview
              </h4>
            </div>
            <div className="flex bg-gray-100 p-0.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewMode('card')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  previewMode === 'card'
                    ? 'bg-white text-secondary shadow-xs font-black'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Smartphone size={13} />
                Card View
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('details')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  previewMode === 'details'
                    ? 'bg-white text-secondary shadow-xs font-black'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LayoutTemplate size={13} />
                Detail View
              </button>
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11px] text-gray-500 mb-4 bg-amber-50/70 border border-amber-200/60 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span>💡</span>
            <span>Live preview updates in real-time as you enter product details on the left.</span>
          </p>

          {/* PREVIEW CONTENT */}
          {previewMode === 'card' ? (
            /* --- CARD PREVIEW --- */
            <div className="max-w-[320px] mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col group select-none">
              {/* Image & Badges */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                <img
                  src={previewImages[previewActiveImageIdx] || previewImages[0] || '/logo.webp'}
                  alt={editingProduct?.name || 'Preview'}
                  className="w-full h-full object-cover transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.webp';
                  }}
                />
                {/* Badges on Top */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  {discountPercent > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {editingProduct?.isFlashSale && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      ⚡ Flash Sale
                    </span>
                  )}
                  {editingProduct?.isFreeDelivery ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      🚚 Free Delivery
                    </span>
                  ) : (editingProduct?.deliveryCharge !== undefined && editingProduct?.deliveryCharge !== null && editingProduct?.deliveryCharge !== '' && Number(editingProduct.deliveryCharge) >= 0) ? (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      🚚 Delivery ৳{editingProduct.deliveryCharge}
                    </span>
                  ) : null}
                </div>

                {/* Code badge bottom-left */}
                {editingProduct?.code && (
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    #{editingProduct.code}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3.5 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-semibold uppercase tracking-wider">{editingProduct?.category || 'Category'}</span>
                  <span className="font-mono text-gray-400">{editingProduct?.brand || 'iShopBD'}</span>
                </div>

                <h5 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                  {editingProduct?.name || 'Product name will appear here'}
                </h5>

                {/* Price Row */}
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-black text-primary">
                    ৳{Number(editingProduct?.price || 0).toLocaleString('en-US')}
                  </span>
                  {Number(editingProduct?.originalPrice || 0) > Number(editingProduct?.price || 0) && (
                    <span className="text-xs text-gray-400 line-through font-semibold">
                      ৳{Number(editingProduct.originalPrice).toLocaleString('en-US')}
                    </span>
                  )}
                </div>

                {/* Stock info */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    {editingProduct?.variants && editingProduct.variants.length > 0
                      ? `${editingProduct.variants.length} Variants`
                      : `${editingProduct?.stock || 0} in stock`}
                  </span>
                  <span className="text-gray-400 text-[10px]">Cash on Delivery Available</span>
                </div>

                {/* Buy Button */}
                <button
                  type="button"
                  className="w-full mt-2 bg-secondary text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs hover:bg-black transition-all"
                >
                  <ShoppingBag size={13} />
                  Order Now
                </button>
              </div>
            </div>
          ) : (
            /* --- DETAILS PREVIEW --- */
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 max-h-[580px] overflow-y-auto no-scrollbar">
              {/* Main Preview Image */}
              <div className="relative aspect-4/3 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
                <img
                  src={previewImages[previewActiveImageIdx] || previewImages[0] || '/logo.webp'}
                  alt={editingProduct?.name || 'Preview'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.webp';
                  }}
                />
                {editingProduct?.code && (
                  <div className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                    Code: {editingProduct.code}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {previewImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {previewImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewActiveImageIdx(idx)}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                        previewActiveImageIdx === idx ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Category */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                    {editingProduct?.category || 'Category'}
                  </span>
                  {editingProduct?.brand && (
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      {editingProduct.brand}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {editingProduct?.name || 'Product Name'}
                </h3>
              </div>

              {/* Price Box */}
              <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-400 block font-semibold">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-primary">
                      ৳{Number(editingProduct?.price || 0).toLocaleString('en-US')}
                    </span>
                    {Number(editingProduct?.originalPrice || 0) > Number(editingProduct?.price || 0) && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳{Number(editingProduct.originalPrice).toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                </div>
                {discountPercent > 0 && (
                  <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Delivery Badge */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] font-bold text-blue-800 flex items-center gap-2">
                <Truck size={16} className="text-blue-600 shrink-0" />
                <span>
                  {editingProduct?.isFreeDelivery
                    ? 'Delivery Fee: Free Delivery (Nationwide)'
                    : (editingProduct?.deliveryCharge !== undefined && editingProduct?.deliveryCharge !== null && editingProduct?.deliveryCharge !== '' && Number(editingProduct.deliveryCharge) >= 0)
                    ? `Delivery Fee: ৳${editingProduct.deliveryCharge} (Nationwide)`
                    : 'Delivery Fee: Inside Dhaka ৳70, Outside Dhaka ৳130'}
                </span>
              </div>

              {/* Variants preview if available */}
              {editingProduct?.variants && editingProduct.variants.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 block mb-1.5">
                    Variants ({editingProduct.variants.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {editingProduct.variants.map((v: any, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg shadow-2xs text-gray-700"
                      >
                        {v.name || `Variant ${i + 1}`} ({v.stock || 0} in stock)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  className="w-full bg-primary text-white font-bold py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-red-700 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} />
                  Order Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Bottom Section: Full Width Products List & Code Search */}
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
      {/* Header and Search Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Product Management &amp; Catalog
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Latest uploaded products appear at the top. Search instantly by Code or Name.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input by Code or Name */}
          <div className="relative min-w-[260px] sm:min-w-[340px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by Code (e.g. SAM-A55) or Name..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-9 pr-9 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c: any) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Total Count Badge */}
          <span className="text-xs font-black bg-primary/10 text-primary px-3 py-2 rounded-2xl border border-primary/20">
            Total: {sortedAndFilteredProducts.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto no-scrollbar min-h-[350px] pb-24">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 text-[10px] text-gray-400 uppercase font-bold border-b border-gray-100">
              <th className="px-6 py-4">Product &amp; Code</th>
              <th className="px-6 py-4">Price &amp; Delivery</th>
              <th className="px-6 py-4">Stock &amp; Variants</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedAndFilteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  <p className="text-sm font-bold">No products found!</p>
                  {searchQuery && (
                    <p className="text-xs text-gray-500 mt-1">
                      No product matches "{searchQuery}".{' '}
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-primary underline font-bold"
                      >
                        Clear Search
                      </button>
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              sortedAndFilteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img
                      loading="lazy"
                      src={p.image || p.images?.[0] || '/logo.webp'}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shrink-0"
                      alt={p.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.webp';
                      }}
                    />
                    <div className="max-w-[200px] sm:max-w-[280px]">
                      <p className="text-sm font-bold text-secondary line-clamp-1">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                        {p.code ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                            <Hash size={10} />
                            {p.code}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-gray-300">No Code</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-secondary">৳{p.price}</p>
                    {p.originalPrice > p.price && (
                      <p className="text-xs text-gray-400 line-through">৳{p.originalPrice}</p>
                    )}
                    {p.isFreeDelivery ? (
                      <span className="inline-block mt-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                        🚚 Free Delivery
                      </span>
                    ) : (p.deliveryCharge !== undefined && p.deliveryCharge !== null && p.deliveryCharge !== '' && Number(p.deliveryCharge) >= 0) ? (
                      <span className="inline-block mt-1 text-[9px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                        🚚 Delivery: ৳{p.deliveryCharge}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    {p.variants && p.variants.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-1">
                          {p.variants.map((v: any, i: number) => (
                            <span
                              key={i}
                              className={`text-[9px] px-1.5 py-[2px] rounded-full font-bold border ${
                                Number(v.stock || 0) <= 5
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              {v.name}: {v.stock || 0}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-700">
                          Total: {getEffectiveStock(p)}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`text-[9px] px-1.5 py-[2px] rounded-full font-bold border ${
                          getEffectiveStock(p) <= 5
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        Stock: {getEffectiveStock(p)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => togglePublishStatus(p)}
                        title={p.isPublished !== false ? 'Published (Live)' : 'Unpublished (Hidden)'}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mr-2 ${
                          p.isPublished !== false ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            p.isPublished !== false ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <div
                        className="relative font-sans"
                        ref={activeProductDropdown === p.id ? productDropdownRef : null}
                      >
                        <button
                          onClick={() => setActiveProductDropdown(activeProductDropdown === p.id ? null : p.id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {activeProductDropdown === p.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden text-sm">
                            <button
                              onClick={() => {
                                setEditingProduct({
                                  ...p,
                                  variants: p.variants || [],
                                  bundleProductIds: p.bundleProductIds || [],
                                  bundleDiscount: p.bundleDiscount || 0,
                                  bundleDiscountType: p.bundleDiscountType || 'percentage',
                                });
                                setActiveProductDropdown(null);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                            >
                              <Edit3 size={16} className="text-primary" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => {
                                copyLandingPageLink(p.id);
                                setActiveProductDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 border-t border-gray-50"
                            >
                              <Share2 size={16} className="text-gray-400" />
                              <span>Copy Link</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDuplicateProduct(p);
                                setActiveProductDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 border-t border-gray-50"
                            >
                              <Copy size={16} className="text-gray-400" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => {
                                openLandingEditor(p);
                                setActiveProductDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 border-t border-gray-50"
                            >
                              <LayoutTemplate size={16} className="text-gray-400" />
                              <span>Landing Page</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteProduct(p.id);
                                setActiveProductDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 border-t border-gray-50"
                            >
                              <Trash2 size={16} className="text-red-500" />
                              <span>Delete Product</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
