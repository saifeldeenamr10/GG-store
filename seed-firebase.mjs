// ─── Upload current games to Firebase (one-time seed script) ─────────────────
// Run with: node seed-firebase.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyDmauSuYg3mGMqS4YJEfo-JWqw2K4UFRzI",
  authDomain: "gg-store-deb9f.firebaseapp.com",
  projectId: "gg-store-deb9f",
  storageBucket: "gg-store-deb9f.firebasestorage.app",
  messagingSenderId: "840758879736",
  appId: "1:840758879736:web:08b3d64334f8e38ce8e20d"
};

// ─── Extract INITIAL_GAMES from data.js ──────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = readFileSync(join(__dirname, 'src/js/data.js'), 'utf8');

const match = dataFile.match(/const INITIAL_GAMES\s*=\s*(\[[\s\S]*?\n\];)/);
if (!match) {
  console.error('❌ Could not find INITIAL_GAMES in data.js');
  process.exit(1);
}

let games;
try {
  games = eval(match[1]);
} catch(e) {
  console.error('❌ Could not parse INITIAL_GAMES:', e.message);
  process.exit(1);
}

console.log(`✅ Found ${games.length} games in INITIAL_GAMES`);

// ─── Upload to Firebase ───────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

try {
  await setDoc(doc(db, 'catalog', 'games'), {
    games,
    updatedAt: Date.now()
  });
  console.log(`🚀 Successfully uploaded ${games.length} games to Firebase Firestore!`);
  console.log('✅ All users will now see the latest data from Firebase.');
  process.exit(0);
} catch (e) {
  console.error('❌ Upload failed:', e.message);
  process.exit(1);
}
