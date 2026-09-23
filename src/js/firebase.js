import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmauSuYg3mGMqS4YJEfo-JWqw2K4UFRzI",
  authDomain: "gg-store-deb9f.firebaseapp.com",
  projectId: "gg-store-deb9f",
  storageBucket: "gg-store-deb9f.firebasestorage.app",
  messagingSenderId: "840758879736",
  appId: "1:840758879736:web:08b3d64334f8e38ce8e20d",
  measurementId: "G-96S34VLE65"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const GAMES_DOC = 'catalog/games';

// ─── READ (single fetch) ───────────────────────────────────────────────────────
export async function fetchGamesFromFirebase() {
  try {
    const snap = await getDoc(doc(db, 'catalog', 'games'));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.games) && data.games.length > 0) {
        return { games: data.games, updatedAt: data.updatedAt || 0 };
      }
    }
  } catch (e) {
    console.warn('[Firebase] fetchGames failed:', e);
  }
  return null;
}

// ─── WRITE ─────────────────────────────────────────────────────────────────────
export async function saveGamesToFirebase(games) {
  try {
    await setDoc(doc(db, 'catalog', 'games'), {
      games,
      updatedAt: Date.now()
    });
    return true;
  } catch (e) {
    console.warn('[Firebase] saveGames failed:', e);
    return false;
  }
}

// ─── REAL-TIME LISTENER ────────────────────────────────────────────────────────
// Calls onUpdate(games, updatedAt) every time the Firestore doc changes.
export function subscribeToGames(onUpdate) {
  return onSnapshot(doc(db, 'catalog', 'games'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.games) && data.games.length > 0) {
        onUpdate(data.games, data.updatedAt || 0);
      }
    }
  }, (err) => {
    console.warn('[Firebase] snapshot error:', err);
  });
}
