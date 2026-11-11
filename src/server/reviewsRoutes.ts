import type { Express } from 'express';
import axios from 'axios';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export interface ReviewsRoutesDeps {
  getCachedProducts: (db?: FirebaseFirestore.Firestore) => Promise<any[]>;
  invalidateProductCache: () => void;
  parseFirestoreDoc: (doc: any) => any;
  getIsAdminSdkHealthy: () => boolean;
}

/**
 * Recalculates a product's aggregate rating and reviewCount from approved reviews only.
 */
async function recalculateProductRating(
  productRef: FirebaseFirestore.DocumentReference,
  invalidateProductCache: () => void
): Promise<{ rating: number; reviewCount: number }> {
  const allReviewsSnap = await productRef.collection('reviews').get();
  const approvedReviews = allReviewsSnap.docs
    .map((d) => d.data())
    .filter((r) => r.status === 'approved' || !r.status);

  const reviewCount = approvedReviews.length;
  const rating =
    reviewCount > 0
      ? Number((approvedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1))
      : 5;

  await productRef.set(
    {
      rating,
      reviewCount,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  invalidateProductCache();
  return { rating, reviewCount };
}

function normalizeReviewCreatedAt(createdAt: any): string {
  if (createdAt?.toDate) return createdAt.toDate().toISOString();
  if (typeof createdAt === 'string') return createdAt;
  if (createdAt?.seconds) return new Date(createdAt.seconds * 1000).toISOString();
  return new Date().toISOString();
}

export function registerReviewsRoutes(
  app: Express,
  { getCachedProducts, invalidateProductCache, parseFirestoreDoc, getIsAdminSdkHealthy }: ReviewsRoutesDeps
): void {
  // Get Product Reviews API (Admin SDK + REST API + Cache fallback)
  app.get('/api/reviews', async (req, res) => {
    try {
      const productId = req.query.productId ? String(req.query.productId).trim() : '';
      const includeAll = req.query.includeAll === 'true';
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required.' });
      }

      if (getIsAdminSdkHealthy()) {
        try {
          const db = getFirestore();
          const snap = await db
            .collection('products')
            .doc(productId)
            .collection('reviews')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

          if (!snap.empty) {
            let reviews = snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                productId: data.productId || productId,
                productName: data.productName || '',
                userId: data.userId || '',
                userName: data.userName || data.name || 'Customer',
                userPhoto: data.userPhoto || null,
                rating: Number(data.rating) || 5,
                comment: data.comment || '',
                images: Array.isArray(data.images) ? data.images : [],
                status: (data.status as 'pending' | 'approved' | 'rejected') || 'approved',
                createdAt: normalizeReviewCreatedAt(data.createdAt),
              };
            });

            if (!includeAll) {
              reviews = reviews.filter((r) => r.status === 'approved');
            }

            return res.json({ success: true, reviews });
          }
        } catch (adminErr: any) {
          console.warn('Admin SDK reviews query warning:', adminErr?.message || adminErr);
        }
      }

      try {
        const apiKey = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8';
        const url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/${encodeURIComponent(
          productId
        )}/reviews?key=${apiKey}&pageSize=50`;
        const response: any = await axios.get(url, {
          headers: { Referer: 'http://localhost:3000/' },
          timeout: 5000,
        });
        if (response.data && Array.isArray(response.data.documents)) {
          let reviews = response.data.documents.map((doc: any) => {
            const parsed = parseFirestoreDoc(doc);
            return {
              id: parsed.id || doc.name.split('/').pop(),
              productId: parsed.productId || productId,
              productName: parsed.productName || '',
              userId: parsed.userId || '',
              userName: parsed.userName || parsed.name || 'Customer',
              userPhoto: parsed.userPhoto || null,
              rating: Number(parsed.rating) || 5,
              comment: parsed.comment || '',
              images: Array.isArray(parsed.images) ? parsed.images : [],
              status: (parsed.status as 'pending' | 'approved' | 'rejected') || 'approved',
              createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
            };
          });

          if (!includeAll) {
            reviews = reviews.filter((r) => r.status === 'approved');
          }

          return res.json({ success: true, reviews });
        }
      } catch (_restErr) {
        // Subcollection might not exist or empty
      }

      const prods = await getCachedProducts();
      const matched = prods.find((p) => p.id === productId || (p.slug && p.slug === productId));
      if (matched && Array.isArray(matched.reviews) && matched.reviews.length > 0) {
        let reviews = matched.reviews.map((r: any) => ({
          ...r,
          status: r.status || 'approved',
        }));
        if (!includeAll) {
          reviews = reviews.filter((r: any) => r.status === 'approved');
        }
        return res.json({ success: true, reviews });
      }

      return res.json({ success: true, reviews: [] });
    } catch (error: any) {
      console.error('Fetch Reviews Error in /api/reviews:', error?.message || error);
      return res.json({ success: true, reviews: [] });
    }
  });

  // Submit Product Review API (Default status: pending for moderation)
  app.post('/api/reviews', async (req, res) => {
    try {
      const { productId, review } = req.body;
      if (!productId || !review) {
        return res.status(400).json({ error: 'Product ID and review data are required.' });
      }

      const cleanProdId = String(productId).trim();
      const reviewId = String(review.id || `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);

      const db = getFirestore();
      const productRef = db.collection('products').doc(cleanProdId);
      const productSnap = await productRef.get();
      const productData = productSnap.exists ? productSnap.data() || {} : {};

      const reviewStatus = review.status || 'pending';
      const reviewData = {
        id: reviewId,
        productId: cleanProdId,
        productName: review.productName || productData.name || 'Product',
        userId: review.userId || `guest_${Math.random().toString(36).substr(2, 5)}`,
        userName: String(review.userName || 'Customer').trim(),
        userPhoto: review.userPhoto || null,
        rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
        comment: String(review.comment || '').trim(),
        images: Array.isArray(review.images) ? review.images : [],
        status: reviewStatus,
        createdAt: review.createdAt || new Date().toISOString(),
      };

      const reviewDocRef = productRef.collection('reviews').doc(reviewId);
      await reviewDocRef.set(reviewData, { merge: true });

      let newRating = Number(productData.rating) || 5;
      let newCount = Number(productData.reviewCount) || 0;

      if (reviewStatus === 'approved') {
        const recalculated = await recalculateProductRating(productRef, invalidateProductCache);
        newRating = recalculated.rating;
        newCount = recalculated.reviewCount;
      }

      return res.json({
        success: true,
        review: reviewData,
        rating: newRating,
        reviewCount: newCount,
      });
    } catch (error: any) {
      console.error('Review Submit Error in /api/reviews:', error);
      return res.status(500).json({ error: 'Failed to submit review', details: error?.message || error });
    }
  });

  // Admin Reviews List API
  app.get('/api/admin/reviews', async (_req, res) => {
    try {
      const db = getFirestore();
      let allReviews: any[] = [];

      try {
        const groupSnap = await db.collectionGroup('reviews').get();
        if (!groupSnap.empty) {
          allReviews = groupSnap.docs.map((docSnap) => {
            const data = docSnap.data();
            const parentProdId = data.productId || docSnap.ref.parent.parent?.id || '';
            return {
              id: docSnap.id,
              productId: parentProdId,
              productName: data.productName || '',
              productImage: data.productImage || '',
              userId: data.userId || '',
              userName: data.userName || data.name || 'Customer',
              userPhoto: data.userPhoto || null,
              rating: Number(data.rating) || 5,
              comment: data.comment || '',
              images: Array.isArray(data.images) ? data.images : [],
              status: (data.status as 'pending' | 'approved' | 'rejected') || 'approved',
              createdAt: normalizeReviewCreatedAt(data.createdAt),
            };
          });
        }
      } catch (grpErr: any) {
        console.warn('collectionGroup reviews fetch error, fallback to individual products:', grpErr?.message || grpErr);
        const prods = await getCachedProducts();
        for (const prod of prods.slice(0, 100)) {
          try {
            const snap = await db.collection('products').doc(prod.id).collection('reviews').get();
            snap.docs.forEach((docSnap) => {
              const data = docSnap.data();
              allReviews.push({
                id: docSnap.id,
                productId: prod.id,
                productName: data.productName || prod.name,
                productImage: prod.image || '',
                userId: data.userId || '',
                userName: data.userName || data.name || 'Customer',
                userPhoto: data.userPhoto || null,
                rating: Number(data.rating) || 5,
                comment: data.comment || '',
                images: Array.isArray(data.images) ? data.images : [],
                status: (data.status as 'pending' | 'approved' | 'rejected') || 'approved',
                createdAt: normalizeReviewCreatedAt(data.createdAt),
              });
            });
          } catch (_e) {}
        }
      }

      if (allReviews.length > 0) {
        const cachedProds = await getCachedProducts();
        const prodMap = new Map(cachedProds.map((p) => [p.id, p]));
        allReviews = allReviews.map((r) => {
          const matchedProd = prodMap.get(r.productId);
          return {
            ...r,
            productName: r.productName || matchedProd?.name || 'Product',
            productImage: r.productImage || matchedProd?.image || '',
          };
        });
      }

      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json({ success: true, reviews: allReviews });
    } catch (error: any) {
      console.error('Admin reviews fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch admin reviews', details: error?.message || error });
    }
  });

  // Admin Review Status Update API (Approve / Reject)
  app.post('/api/admin/reviews/status', async (req, res) => {
    try {
      const { productId, reviewId, status } = req.body;
      if (!productId || !reviewId || !status) {
        return res.status(400).json({ error: 'productId, reviewId, and status are required.' });
      }

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
      }

      const db = getFirestore();
      const productRef = db.collection('products').doc(String(productId).trim());
      const reviewRef = productRef.collection('reviews').doc(String(reviewId).trim());

      await reviewRef.set({ status, updatedAt: new Date().toISOString() }, { merge: true });

      const { rating, reviewCount } = await recalculateProductRating(productRef, invalidateProductCache);

      return res.json({
        success: true,
        status,
        rating,
        reviewCount,
      });
    } catch (error: any) {
      console.error('Admin review status update error:', error);
      return res.status(500).json({ error: 'Failed to update review status', details: error?.message || error });
    }
  });

  // Admin Review Delete API
  app.delete('/api/admin/reviews', async (req, res) => {
    try {
      const productId = String(req.body.productId || req.query.productId || '').trim();
      const reviewId = String(req.body.reviewId || req.query.reviewId || '').trim();

      if (!productId || !reviewId) {
        return res.status(400).json({ error: 'productId and reviewId are required.' });
      }

      const db = getFirestore();
      const productRef = db.collection('products').doc(productId);
      const reviewRef = productRef.collection('reviews').doc(reviewId);

      await reviewRef.delete();

      const { rating, reviewCount } = await recalculateProductRating(productRef, invalidateProductCache);

      return res.json({ success: true, rating, reviewCount });
    } catch (error: any) {
      console.error('Admin review delete error:', error);
      return res.status(500).json({ error: 'Failed to delete review', details: error?.message || error });
    }
  });
}
