import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp, addDoc, increment, runTransaction, orderBy, getDocFromServer, arrayUnion, arrayRemove, limit, DocumentReference } from 'firebase/firestore';
import rawFirebaseConfig from '../../firebase-applet-config.json';

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0'
);

export const firebaseConfig = {
  ...rawFirebaseConfig,
  authDomain: isLocalhost ? `${rawFirebaseConfig.projectId}.firebaseapp.com` : (rawFirebaseConfig.authDomain || `${rawFirebaseConfig.projectId}.firebaseapp.com`)
};

import { getStorage } from 'firebase/storage';
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
import { memoryLocalCache } from 'firebase/firestore';

const isMobileOrInApp = typeof window !== 'undefined' && (
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  /FBAN|FBAV|FB_IAB|Messenger|Instagram|Line|WhatsApp/i.test(navigator.userAgent) ||
  /WebKit.*Mobile/i.test(navigator.userAgent)
);

let firestoreInstance: any;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: isMobileOrInApp 
      ? memoryLocalCache() 
      : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    ignoreUndefinedProperties: true
  });
} catch (err1) {
  try {
    firestoreInstance = initializeFirestore(app, {
      localCache: memoryLocalCache(),
      ignoreUndefinedProperties: true
    });
  } catch (err2) {
    try {
      firestoreInstance = getFirestore(app);
    } catch (err3) {
      console.error("Firestore init fallback error:", err3);
    }
  }
}
export const db = firestoreInstance;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({ auth_type: 'reauthenticate' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  const isQuota = 
    code === 'resource-exhausted' || 
    code === 'auth/quota-exceeded' || 
    message.includes("Quota exceeded") || 
    message.includes("quota-exceeded") || 
    message.includes("LIMIT_EXCEEDED");

  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  
  if (isQuota) {
    console.warn('Firestore Quota Exceeded: ', JSON.stringify(errInfo));
    // Dispatch global event so the App can react without needing try/catch everywhere
    window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
    // We return rather than throw to prevent "Uncaught Error" across the app
    return;
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // Do not throw error here, it crashes the React app with a white screen when an index is missing.
    // throw new Error(JSON.stringify(errInfo));
    return;
  }
}

export { 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
  addDoc,
  increment,
  runTransaction,
  orderBy,
  arrayUnion,
  arrayRemove,
  limit,
  DocumentReference
};

let messagingInstance: any = null;
try {
  if (
    typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window && 
    'Notification' in window
  ) {
    messagingInstance = getMessaging(app);
  }
} catch (err) {
  console.warn('Firebase Messaging not supported in this browser context:', err);
}

export const messaging = messagingInstance;

export const requestPushPermission = async (userId: string) => {
  if (!messaging) return;
  try {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: 'BAoWsjG0WV_UiRrgRBqtZX4dfenDwM2tE5ow6Xci1IYcM8XOOpUid1vZjFBILsxcZPZ9mGFS4fskELv5S_9Nb5M' 
      });
      if (token) {
        await updateDoc(doc(db, 'users', userId), { fcmToken: token });
      }
    }
  } catch (err) {
    console.warn('Failed to get push token:', err);
  }
};
