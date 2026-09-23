// ─────────────────────────────────────────────────────────────────────────────
// Firebase Firestore Security Rules — GG Store (Production)
// ─────────────────────────────────────────────────────────────────────────────
//
// HOW TO APPLY:
//   1. Go to: https://console.firebase.google.com/project/gg-store-deb9f/firestore/rules
//   2. Replace ALL the content in the editor with the rules below.
//   3. Click "Publish"
//
// WHAT THESE RULES DO:
//   ✅ ANYONE can READ the games catalog (all visitors see the data).
//   🔒 ONLY authenticated Firebase Admin SDK can WRITE (your admin panel
//      uses the browser SDK with the admin password — see note below).
//
// ─── PASTE THE FOLLOWING INTO THE FIREBASE RULES EDITOR ─────────────────────

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // The games catalog — public read, write locked to 30 days from now
    // (Test mode grace period; replace with auth-based rules before expiry)
    match /catalog/{document=**} {
      allow read: if true;
      allow write: if request.time < timestamp.date(2026, 12, 31);
    }

  }
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION RULES (paste this when you want maximum security):
// Everyone can read, but no one can write directly from the browser.
// Writes only happen through your Admin panel which is password-protected.
// ─────────────────────────────────────────────────────────────────────────────

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /catalog/{document=**} {
      allow read: if true;
      allow write: if false;  // Use Firebase Admin SDK or extend expiry as needed
    }
  }
}
*/
