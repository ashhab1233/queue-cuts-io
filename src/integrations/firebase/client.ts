import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// LocalStorage key for storing Firebase Web config JSON
const CONFIG_KEY = "firebaseConfig";

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
  measurementId?: string;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getStoredFirebaseConfig(): FirebaseWebConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.apiKey && parsed.projectId && parsed.appId && parsed.authDomain) {
      return parsed as FirebaseWebConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredFirebaseConfig(cfg: FirebaseWebConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

export function clearStoredFirebaseConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

export function initFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  const cfg = getStoredFirebaseConfig();
  if (!cfg) return null;
  if (!app) {
    app = initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return app && auth && db ? { app, auth, db } : null;
}

export function getFirebase() {
  // Ensure initialized if possible
  if (!app || !auth || !db) {
    const inited = initFirebase();
    if (!inited) throw new Error("Firebase is not configured. Please add your web config.");
    return inited;
  }
  return { app, auth, db } as { app: FirebaseApp; auth: Auth; db: Firestore };
}

export function getTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
