/**
 * Vitest Global Test Setup
 * এই ফাইলটি প্রতিটি test এর আগে run হয়।
 */
import '@testing-library/jest-dom';

// Firebase mock — tests-এ real Firebase connection দরকার নেই
vi.mock('../lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  db: {},
  googleProvider: {},
  facebookProvider: {},
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return vi.fn(); // unsubscribe
  }),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(() => vi.fn()),
  getDocFromServer: vi.fn(() => Promise.resolve({ exists: () => false })),
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
  updateDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  increment: vi.fn((n) => n),
  orderBy: vi.fn(() => ({})),
  runTransaction: vi.fn(),
  handleFirestoreError: vi.fn(),
  OperationType: { GET: 'GET', SET: 'SET', UPDATE: 'UPDATE', DELETE: 'DELETE' },
  arrayUnion: vi.fn((...args) => args),
  limit: vi.fn(() => ({})),
  DocumentReference: {},
}));

// browser-image-compression mock
vi.mock('browser-image-compression', () => ({
  default: vi.fn((file) => Promise.resolve(file)),
}));

// react-hot-toast mock
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// scrollTo mock
window.scrollTo = vi.fn() as any;
