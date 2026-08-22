const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccountPath = 'E:/Making File/Logo/ishopbd.com/api/service-account.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.cert(serviceAccount)
});

const db = getFirestore();

async function checkProducts() {
  console.log("Fetching products from Firestore...");
  const snapshot = await db.collection('products').get();
  console.log(`Total products: ${snapshot.size}`);

  let totalBytes = 0;
  let base64Count = 0;
  let largeDocs = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const str = JSON.stringify(data);
    const bytes = Buffer.byteLength(str, 'utf8');
    totalBytes += bytes;

    let hasBase64 = false;
    if (typeof data.image === 'string' && data.image.startsWith('data:')) {
      hasBase64 = true;
    }
    if (Array.isArray(data.images)) {
      for (const img of data.images) {
        if (typeof img === 'string' && img.startsWith('data:')) {
          hasBase64 = true;
          break;
        }
      }
    }

    if (hasBase64) {
      base64Count++;
    }

    if (bytes > 50 * 1024) { // > 50KB
      largeDocs.push({
        id: doc.id,
        name: data.name,
        sizeKB: (bytes / 1024).toFixed(1),
        hasBase64
      });
    }
  });

  console.log(`\n--- Statistics ---`);
  console.log(`Total Data Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Average Product Size: ${(totalBytes / snapshot.size / 1024).toFixed(1)} KB`);
  console.log(`Products with base64 images: ${base64Count}`);
  console.log(`Large documents (>50KB): ${largeDocs.length}`);
  
  if (largeDocs.length > 0) {
    console.log("\nTop large documents:");
    largeDocs.sort((a,b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB)).slice(0, 10).forEach(d => {
      console.log(`- ID: ${d.id}, Name: "${d.name}", Size: ${d.sizeKB} KB, Has Base64: ${d.hasBase64}`);
    });
  }
}

checkProducts().catch(console.error);
