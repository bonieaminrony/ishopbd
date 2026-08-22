import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./api/service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.cert(serviceAccount)
});

async function check() {
  const db = getFirestore();
  const snapshot = await db.collection('products').get();
  const products = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
  
  const getTs = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'string') return new Date(val).getTime();
    if (val._seconds) return val._seconds * 1000;
    if (val.seconds) return val.seconds * 1000;
    return 0;
  };

  const withTs = products.map(p => ({
    name: p.name,
    c: getTs(p.createdAt),
    u: getTs(p.updatedAt),
    max: Math.max(getTs(p.createdAt), getTs(p.updatedAt))
  }));

  const byMax = [...withTs].sort((a, b) => b.max - a.max).slice(0, 10);
  const byC = [...withTs].sort((a, b) => b.c - a.c).slice(0, 10);

  console.log("Top 10 by Math.max(c, u) [Localhost behavior]:");
  byMax.forEach(p => console.log(p.name, new Date(p.max).toISOString()));

  console.log("\nTop 10 by c (createdAt) only:");
  byC.forEach(p => console.log(p.name, new Date(p.c).toISOString()));
}
check().catch(console.error);
