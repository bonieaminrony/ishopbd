const fs = require('fs');

let content = fs.readFileSync('src/components/ProductDetails.tsx', 'utf8');

const regex = /<div className="ml-auto flex items-center gap-2">[\s\S]*?<Share2 size=\{18\} \/>[\s\S]*?<\/button>\s*<button[\s\S]*?<Heart size=\{18\}[\s\S]*?<\/button>\s*<\/div>/;

const newMobileShareBlock = `<div className="ml-auto flex flex-wrap items-center gap-4 justify-end">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 hidden sm:inline">Share:</span>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(\`https://www.facebook.com/dialog/send?link=\${shareUrl.toString()}&app_id=291494419107518&redirect_uri=\${shareUrl.toString()}\`, '_blank');
                              }} className="text-gray-500 hover:text-blue-600 transition-colors"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.899 1.488 5.485 3.82 7.158v3.584l3.472-1.921c.854.238 1.761.365 2.708.365 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.096 12.385l-2.775-2.955-5.412 2.955 5.962-6.332 2.836 2.955 5.348-2.955-5.959 6.332z"/></svg></button>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(\`https://wa.me/?text=\${encodeURIComponent(selectedProduct.name + ' ' + shareUrl.toString())}\`, '_blank');
                              }} className="text-gray-500 hover:text-green-500 transition-colors"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                navigator.clipboard.writeText(shareUrl.toString());
                                alert('Link copied to clipboard!');
                              }} className="text-gray-500 hover:text-gray-900 transition-colors"><LinkIcon size={16} /></button>
                            </div>
                            <div className="flex items-center text-sm font-medium">
                              <button onClick={() => handleLikeProduct(selectedProduct.id)} className={\`flex items-center gap-1 transition-colors \${likedProducts.includes(selectedProduct.id) ? "text-primary" : "text-gray-600 hover:text-primary"}\`}><Bookmark size={16} fill={likedProducts.includes(selectedProduct.id) ? "currentColor" : "none"} /> Save</button>
                            </div>
                          </div>`;

content = content.replace(regex, newMobileShareBlock);

fs.writeFileSync('src/components/ProductDetails.tsx', content);
console.log('Mobile share section updated with regex');
