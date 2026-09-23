// ─── Upload current games to Firebase (one-time seed script) ─────────────────
// Run with: node seed-firebase.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env manually (no dotenv dependency needed)
const envFile = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '.env'), 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
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
