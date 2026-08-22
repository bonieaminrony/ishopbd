import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.join(process.cwd(), "api", "service-account.json");
admin.initializeApp({
  credential: admin.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
  projectId: "i-shop-bd",
  databaseURL: "https://i-shop-bd.firebaseio.com"
});

const db = getFirestore();

async function run() {
  console.log("Searching for Ven-Dens Power Bank...");
  const snapshot = await db.collection('products')
    .where('name', '>=', 'Ven-Dens')
    .where('name', '<=', 'Ven-Dens\uf8ff')
    .get();

  if (snapshot.empty) {
    console.log("No product found matching 'Ven-Dens'.");
    process.exit(1);
  }
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.name.includes('PB059') || data.name.includes('Power Bank') || data.name.includes('20000mAh')) {
       console.log('Found product to update:', data.name, '| ID:', doc.id);
       
       let specs = data.specifications || [];
       
       // Filter out 'Features' and fix 'Model'
       specs = specs.filter(s => s.name.toLowerCase() !== 'features');
       specs = specs.map(s => {
         if (s.name.toLowerCase() === 'model') {
           return { ...s, value: 'VD-PB059' };
         }
         return s;
       });
       
       // Also ensure name is perfectly SEO formatted
       const newName = 'Ven-Dens 20000mAh Power Bank (VD-PB059) - Best Price in BD';
       
       // Update description to have proper spacing and bullet points
       const newDesc = `Looking for the best power bank for travel or load shedding? The **Ven-Dens 20000mAh Power Bank (Model: VD-PB059)** is your perfect solution. It features a massive 20,000mAh battery capacity with 18W fast charging support (PD & QC), ensuring your phone never runs out of charge. 

At **i SHOP BD**, we offer the original Ven-Dens Power Bank at the most affordable **price in Bangladesh**. Its premium metallic finish and smart Digital LED display add a sleek look to your gadget collection. Designed for fast charging multiple devices at once, it is your ideal travel companion.

**Why Buy This Power Bank?**
- **18W Fast Charging:** Quickly charges your devices using Power Delivery (PD) & Quick Charge (QC).
- **Massive Capacity:** 20,000mAh easily charges a smartphone 3 to 4 times.
- **Multi-Device Support:** Charge multiple devices simultaneously.

Buy the **Ven-Dens VD-PB059 Power Bank** online from i SHOP BD today and get fast home delivery anywhere in BD!`;

       await doc.ref.update({
         specifications: specs,
         name: newName,
         description: newDesc
       });
       console.log('✅ Product updated successfully in Firebase!');
    }
  }
}

run().catch(console.error).finally(() => process.exit(0));
