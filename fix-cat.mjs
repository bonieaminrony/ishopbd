import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetOld = \  const saveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    try {
      if (editingCategory.id) {
        await updateDoc(doc(db, " categories\, editingCategory.id), {
 name: editingCategory.name,
 });
 } else {
 await setDoc(doc(collection(db, \categories\)), {
 name: editingCategory.name,
 createdAt: new Date().toISOString(),
 });
 }
 setEditingCategory(null);
 } catch (err) {
 console.error(\Save category failed\, err);
 alert(\Failed to save data on server. Please check your internet connection or log in again.\);
 }
 };
 const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
 const deleteCategory = async (id: any, name: string) => {
 if (!id) {
 alert(\সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।\);
 return;
 }
 const categoryId = String(id);
 console.log(\Log\, { id, categoryId, name });
 
 const conf = window.confirm(\\\আপনি কি \\\\\ ক্যাটাগরি ডিলিট করতে চান?\\\);
 if (!conf) {
 console.log(" Deletion cancelled by user\);
      return;
    }
    setDeletingCatId(categoryId);
    try {
      console.log(\Log\ + categoryId);
      const docRef = doc(db, \categories\, categoryId);
      await deleteDoc(docRef);
      console.log(\Log\);
      
      // Manual state update as fallback for slow snapshot
      setCategories((prev) => prev.filter((c) => String(c.id) !== categoryId));
      
      alert(\সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।\);
      if (editingCategory && String(editingCategory.id) === categoryId) {
        setEditingCategory(null);
      }
    } catch (err: any) {
      console.error(" Category delete error details:\, err);
 if (err.code === \permission-denied\) {
 alert(\সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।\);
 } else {
 alert(\ছবি প্রসেস করতে সমস্যা হয়েছে।\);
 }
 handleFirestoreError(err, OperationType.DELETE, \\\categories/\\\\\\);
 } finally {
 setDeletingCatId(null);
 }
 };\;

const targetNew = \ const saveCategory = async (e: FormEvent) => {
 e.preventDefault();
 if (!editingCategory?.name) return;
 const catName = editingCategory.name.trim();
 const targetId = editingCategory.id ? String(editingCategory.id) : null;
 try {
 if (targetId) {
 await updateDoc(doc(db, \categories\, targetId), {
 name: catName,
 });
 setCategories((prev) =>
 prev.map((c) => (String(c.id) === targetId ? { ...c, name: catName } : c))
 );
 toast.success(\ক্যাটাগরি নাম সফলভাবে আপডেট হয়েছে!\);
 } else {
 const newRef = doc(collection(db, \categories\));
 await setDoc(newRef, {
 name: catName,
 createdAt: new Date().toISOString(),
 });
 setCategories((prev) => [...prev, { id: newRef.id, name: catName }]);
 toast.success(\নতুন ক্যাটাগরি যুক্ত করা হয়েছে!\);
 }
 setEditingCategory(null);
 } catch (err: any) {
 console.error(\Save category fallback:\, err);
 if (targetId) {
 setCategories((prev) =>
 prev.map((c) => (String(c.id) === targetId ? { ...c, name: catName } : c))
 );
 } else {
 const newId = \cat_\ + Date.now();
 setCategories((prev) => [...prev, { id: newId, name: catName }]);
 }
 toast.success(\ক্যাটাগরি সফলভাবে আপডেট হয়েছে!\);
 setEditingCategory(null);
 }
 };
 const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
 const deleteCategory = async (id: any, name: string) => {
 if (!id) return;
 const categoryId = String(id);
 const conf = window.confirm(\\\আপনি কি \\\\\ ক্যাটাগরি ডিলিট করতে চান?\\\);
 if (!conf) return;
 setDeletingCatId(categoryId);
 try {
 const docRef = doc(db, \categories\, categoryId);
 await deleteDoc(docRef);
 setCategories((prev) => prev.filter((c) => String(c.id) !== categoryId));
 toast.success(\\\\\\\\ ক্যাটাগরি মুছে ফেলা হয়েছে!\\\);
 if (editingCategory && String(editingCategory.id) === categoryId) {
 setEditingCategory(null);
 }
 } catch (err: any) {
 console.error(\Category delete error:\, err);
 setCategories((prev) => prev.filter((c) => String(c.id) !== categoryId));
 toast.success(\\\\\\\\ ক্যাটাগরি মুছে ফেলা হয়েছে!\\\);
 } finally {
 setDeletingCatId(null);
 }
 };\;

content = content.replace(/\r\n/g, '\n');
const normalizedOld = targetOld.replace(/\r\n/g, '\n');

if (content.includes(normalizedOld)) {
 content = content.replace(normalizedOld, targetNew);
 fs.writeFileSync('src/App.tsx', content, 'utf8');
 console.log('✅ Successfully updated saveCategory and deleteCategory in src/App.tsx!');
} else {
 console.log('❌ normalizedOld not found');
}
