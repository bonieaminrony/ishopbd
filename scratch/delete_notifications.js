import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Starting deletion...");
  try {
    const q = query(collection(db, "notifications"));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const data = d.data();
      if (data.title === "dgfdb" || data.title === "hhh" || data.message === "bcvbc" || data.message === "hhh") {
        await deleteDoc(doc(db, "notifications", d.id));
        console.log("Deleted", d.id);
      }
    }
    console.log("Finished!");
  } catch (e) {
    console.error("Error", e);
  }
  process.exit(0);
}
run();
