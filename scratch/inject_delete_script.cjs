const fs = require('fs');
const path = 'e:/Making File/Logo/ishopbd.com/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const injectCode = `
  useEffect(() => {
    const deleteBadNotifs = async () => {
      try {
        const q = query(collection(db, "notifications"));
        const snap = await getDocs(q);
        snap.docs.forEach(async (d) => {
          const data = d.data();
          if (data.title === "dgfdb" || data.title === "hhh" || data.message === "bcvbc" || data.message === "hhh") {
            try { await deleteDoc(doc(db, "notifications", d.id)); console.log("Deleted bad notif", d.id); } catch(e) {}
          }
        });
      } catch (e) {
        console.error(e);
      }
    };
    deleteBadNotifs();
  }, []);
`;

if (!content.includes('deleteBadNotifs')) {
  const searchStr = 'const App = () => {';
  content = content.replace(searchStr, searchStr + injectCode);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Injected cleanup script');
} else {
  console.log('Cleanup script already injected');
}
