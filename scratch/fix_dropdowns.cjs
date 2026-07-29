const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const categoryFieldNew = `<div id="field-category">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                              <span>Category</span>
                              {productFormErrors.category ? <span className="text-red-500 normal-case font-normal">Select Category</span> : <span className="text-red-400 normal-case font-normal">* Required</span>}
                            </label>
                            <div className="relative">
                              <select
                                value={editingProduct?.category || ""}
                                onChange={(e) => { setEditingProduct((prev) => ({ ...(prev || {}), category: e.target.value, subcategory: "" })); if (productFormErrors.category) setProductFormErrors((prev) => ({ ...prev, category: false })); }}
                                className={\`appearance-none w-full bg-gray-50 border \${productFormErrors.category ? "border-red-400 ring-1 ring-red-400" : "border-gray-200"} rounded-xl py-2.5 pl-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold cursor-pointer\`}
                              >
                                <option value="">— Select Category —</option>
                                {categories.map((cat) => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                          </div>`;

if(content.includes('id="field-category"')) {
  console.log('Category field exists. Replacing...');
  content = content.replace(/<div id="field-category">[\s\S]*?<\/select>\n                          <\/div>/, categoryFieldNew);
}

const subcatNew = `<div id="field-subcategory">
                              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Sub-Category</label>
                              <div className="relative">
                                <select
                                  value={editingProduct?.subcategory || ""}
                                  onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), subcategory: e.target.value }))}
                                  className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold cursor-pointer"
                                >
                                  <option value="">— Select Sub-Category —</option>
                                  {subcats.map((sub, idx) => (<option key={idx} value={sub}>{sub}</option>))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                              </div>
                            </div>`;

if(content.includes('id="field-subcategory"')) {
  console.log('Subcategory field exists. Replacing...');
  content = content.replace(/<div id="field-subcategory">[\s\S]*?<\/select>\n                            <\/div>/, subcatNew);
}

// Ensure ChevronDown is imported
if (!content.includes('ChevronDown')) {
  content = content.replace("CheckCircle2,", "CheckCircle2, ChevronDown,");
}

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log('Dropdowns fixed!');
