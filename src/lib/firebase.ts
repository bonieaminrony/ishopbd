import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp, addDoc, increment, runTransaction, orderBy, getDocFromServer, arrayUnion, arrayRemove, limit, DocumentReference } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
  ignoreUndefinedProperties: true
}, (firebaseConfig as any).firestoreDatabaseId);

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

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestPushPermission = async (userId: string) => {
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: 'BAoWsjG0WV_UiRrgRBqtZX4dfenDwM2tE5ow6Xci1IYcM8XOOpUid1vZjFBILsxcZPZ9mGFS4fskELv5S_9Nb5M' });
      if (token) {
        await updateDoc(doc(db, 'users', userId), { fcmToken: token });
      }
    }
  } catch (err) {
    console.warn('Failed to get push token:', err);
  }
};
