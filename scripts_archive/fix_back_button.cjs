const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const urlEffectTarget = `  useEffect(() => {
    if (products.length === 0) return;
    const url = new URL(window.location.href);
    if (isProductDetailsOpen && selectedProduct) {
      url.searchParams.set("p", selectedProduct.id || "");
      // Add a clean slug from name
      const slug = (selectedProduct.name || "").toLowerCase().replace(/ /g, "-").replace(/[^\\w-]/g, "");
      if (slug) url.searchParams.set("prod", slug);
    } else {
      url.searchParams.delete("p");
      url.searchParams.delete("prod");
    }
    window.history.replaceState({}, "", url.toString());
  }, [isProductDetailsOpen, selectedProduct, products.length]);`;

const urlEffectReplacement = `  useEffect(() => {
    if (products.length === 0) return;
    const url = new URL(window.location.href);
    
    // Check if we need to push or replace
    const hasP = url.searchParams.has("p");
    
    if (isProductDetailsOpen && selectedProduct) {
      const slug = (selectedProduct.name || "").toLowerCase().replace(/ /g, "-").replace(/[^\\w-]/g, "");
      url.searchParams.set("p", selectedProduct.id || "");
      if (slug) url.searchParams.set("prod", slug);
      
      if (!hasP) {
        window.history.pushState({ isModal: true }, "", url.toString());
      } else {
        window.history.replaceState({ isModal: true }, "", url.toString());
      }
    } else {
      if (hasP || url.searchParams.has("prod")) {
        url.searchParams.delete("p");
        url.searchParams.delete("prod");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [isProductDetailsOpen, selectedProduct, products.length]);

  // Handle back button / popstate
  useEffect(() => {
    const handlePopState = (e) => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("p")) {
        setIsProductDetailsOpen(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setIsProductDetailsOpen]);`;

content = content.replace(urlEffectTarget, urlEffectReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
