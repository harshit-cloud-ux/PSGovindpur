/**
 * seedGallery.mjs — populate the `galleryEvents` Firestore collection from Cloudinary.
 *
 *   node seedGallery.mjs --discover   list every sub-folder under the gallery root + image counts
 *   node seedGallery.mjs              seed every event in events.config.js that has a `folder`
 *   node seedGallery.mjs --dry        show what WOULD be written, write nothing
 *
 * Required env vars (put them in scripts/.env, which is .gitignored):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   ADMIN_EMAIL        the Firebase admin account (so writes pass security rules)
 *   ADMIN_PASSWORD
 *
 * Optional:
 *   GALLERY_ROOT       defaults to 'ps_govindpur/gallery'
 *   MAX_PHOTOS         defaults to 11  (only the first N images per event get seeded)
 */

import 'dotenv/config';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// ── Config ───────────────────────────────────────────────────────────
const ROOT = process.env.GALLERY_ROOT || 'ps_govindpur/gallery';
const MAX_PHOTOS = Number(process.env.MAX_PHOTOS || 11);

const firebaseConfig = {
  apiKey: 'AIzaSyAJMC5E1jOmLk-z6g9x5DhTj5Oc-UxzwKY',
  authDomain: 'ps-govindpur.firebaseapp.com',
  projectId: 'ps-govindpur',
  storageBucket: 'ps-govindpur.firebasestorage.app',
  messagingSenderId: '274491947776',
  appId: '1:274491947776:web:5afb5195f47dd1d8fe11e5',
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const args = process.argv.slice(2);
const DISCOVER = args.includes('--discover');
const INIT = args.includes('--init');
const DRY = args.includes('--dry');

// Canonical titles + intended display order. The matcher maps each Cloudinary
// folder to one of these so events.config.js gets the right title and order
// automatically. Folders that don't match keep their folder name as the title.
const CANON = [
  [1,  'प्रातः कालीन प्रार्थना सत्र'],
  [2,  'सांयकालीन बाल सभा'],
  [3,  'प्रेरणादाई मध्यान भोजन सत्र'],
  [4,  'स्वतंत्रता दिवस 2025'],
  [5,  'गणतंत्र दिवस समारोह 2026'],
  [6,  'विद्यालय वार्षिकोत्सव 2026'],
  [7,  'स्कूल चलो अभियान'],
  [8,  'खेलकूद प्रतियोगिताएं'],
  [9,  'शिक्षक अभिभावक संगोष्ठी'],
  [10, 'एक पेड़ मां के नाम कार्यक्रम'],
  [11, 'होली कार्यक्रम 2026'],
  [12, 'बीएसए महोदय का विद्यालय भ्रमण 2025'],
  [13, 'हिंदू नव वर्ष चैत्र प्रतिपदा उत्सव 2026'],
  [14, 'नामांकन मेला 2026'],
  [15, 'फेयरवेल कार्यक्रम 2026'],
  [16, 'स्मार्ट क्लास उद्घाटन'],
  [17, 'विद्यार्थी जन्मदिवस'],
  [18, 'विद्यारंभ सत्र 2026-27'],
  [19, 'कथावाचक सुश्री चारु चर्चिका कार्यक्रम 2026'],
  [20, 'कविताएं'],
  [21, 'अन्य कार्यक्रम'],
  [22, 'सुर्खियों में गोविंदपुर'],
];

// Split into word tokens, dropping digits/punctuation and 1-char tokens.
const tokenize = (s) =>
  s.replace(/[0-9०-९._\-]+/g, ' ').split(/\s+/).filter((t) => t.length > 1);

// Best canonical match for a folder name, by weighted shared-token overlap.
function bestMatch(folder) {
  const fset = new Set(tokenize(folder));
  let best = null, bestScore = 0;
  for (const [order, title] of CANON) {
    let score = 0;
    for (const w of tokenize(title)) if (fset.has(w)) score += Math.min(w.length, 4);
    if (score > bestScore) { bestScore = score; best = { order, title }; }
  }
  return bestScore >= 3 ? best : null;
}

// ── Cloudinary helpers ───────────────────────────────────────────────

// List immediate sub-folders of ROOT. Works in both fixed- and dynamic-folder modes.
async function listSubFolders() {
  const res = await cloudinary.api.sub_folders(ROOT);
  return res.folders.map((f) => f.name); // f.name = leaf name, f.path = full path
}

// List image URLs inside one sub-folder, sorted by filename so 01,02,03... controls order.
// Tries dynamic-folder mode first (asset_folder), falls back to fixed-folder prefix mode.
async function listImages(subFolder) {
  const fullPath = `${ROOT}/${subFolder}`;
  let resources = [];

  try {
    // Dynamic-folder accounts: folders are metadata, not part of public_id.
    let next;
    do {
      const res = await cloudinary.api.resources_by_asset_folder(fullPath, {
        max_results: 100,
        next_cursor: next,
      });
      resources.push(...res.resources);
      next = res.next_cursor;
    } while (next);
  } catch {
    resources = [];
  }

  if (resources.length === 0) {
    // Fixed-folder accounts: folder path is baked into public_id.
    let next;
    do {
      const res = await cloudinary.api.resources({
        type: 'upload',
        prefix: `${fullPath}/`,
        max_results: 100,
        next_cursor: next,
      });
      resources.push(...res.resources);
      next = res.next_cursor;
    } while (next);
  }

  return resources
    .filter((r) => r.resource_type === 'image')
    .sort((a, b) => (a.public_id > b.public_id ? 1 : -1))
    .map((r) => r.secure_url);
}

// ── Modes ────────────────────────────────────────────────────────────

async function discover() {
  console.log(`\nScanning ${ROOT} ...\n`);
  const folders = await listSubFolders();
  if (folders.length === 0) {
    console.log('No sub-folders found. Check CLOUDINARY_CLOUD_NAME and GALLERY_ROOT.');
    return;
  }
  for (const f of folders) {
    const imgs = await listImages(f);
    console.log(`  ${String(imgs.length).padStart(3)} imgs   ${f}`);
  }
  console.log(`\n${folders.length} folders found. Copy the names into events.config.js → folder.\n`);
}

// Auto-generate events.config.js from the real Cloudinary folders.
async function init() {
  console.log(`\nScanning ${ROOT} ...\n`);
  const folders = await listSubFolders();
  if (folders.length === 0) {
    console.log('No sub-folders found. Check CLOUDINARY_CLOUD_NAME and GALLERY_ROOT.');
    return;
  }

  const used = new Set();
  let overflow = 23;
  const entries = folders.map((f) => {
    const m = bestMatch(f);
    if (m && !used.has(m.order)) {
      used.add(m.order);
      return { order: m.order, title: m.title, folder: f, matched: true };
    }
    return { order: overflow++, title: f, folder: f, matched: false };
  });
  entries.sort((a, b) => a.order - b.order);

  const body = entries
    .map((e) => `  { order: ${e.order}, title: ${JSON.stringify(e.title)}, folder: ${JSON.stringify(e.folder)}, photosAlbumUrl: '', videos: [] },`)
    .join('\n');

  const file =
`// AUTO-GENERATED by: npm run init
// 'folder' is the exact Cloudinary folder — DO NOT edit it.
// 'title' and 'order' are safe to change.
// Add a Google Photos album link (photosAlbumUrl) and YouTube links (videos)
// wherever you have them, e.g.:
//   videos: [{ title: 'झंडारोहण', url: 'https://youtu.be/XXXXXXXXXXX' }],
// Then run: npm run seed

export default [
${body}
];
`;

  fs.writeFileSync(new URL('./events.config.js', import.meta.url), file);

  console.log(`Wrote events.config.js with ${entries.length} events:\n`);
  for (const e of entries) {
    console.log(`  [${String(e.order).padStart(2)}] ${e.matched ? '  ' : '? '}${e.title}`);
  }
  console.log(`\n  '?' = no confident title match; using the folder name (edit if you like).`);
  console.log(`  Next: add album/video links if you have them, then  npm run dry  and  npm run seed\n`);
}

async function seed() {
  const { default: events } = await import('./events.config.js');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  if (!DRY) {
    await signInWithEmailAndPassword(
      getAuth(app),
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );
  }

  const todo = events.filter((e) => e.folder && e.folder.trim() !== '');
  console.log(`\nSeeding ${todo.length} of ${events.length} events${DRY ? ' (dry run)' : ''}...\n`);

  for (const e of todo) {
    const all = await listImages(e.folder);
    const photos = all.slice(0, MAX_PHOTOS);
    const id = String(e.order).padStart(2, '0'); // doc id 01..22 keeps Firestore ordering sane

    const docData = {
      title: e.title,
      order: e.order,
      folder: e.folder,
      photos,
      videos: (e.videos || []).filter((v) => v.url && v.url.trim() !== ''),
      photosAlbumUrl: e.photosAlbumUrl || '',
      updatedAt: Date.now(),
    };

    if (DRY) {
      console.log(`  [${id}] ${e.title}  —  ${photos.length}/${all.length} photos, ${docData.videos.length} videos${docData.photosAlbumUrl ? ', album✓' : ''}`);
      continue;
    }

    await setDoc(doc(db, 'galleryEvents', id), docData, { merge: true });
    console.log(`  ✓ [${id}] ${e.title}  (${photos.length} photos)`);
  }

  console.log('\nDone.\n');
  process.exit(0);
}

// ── Run ──────────────────────────────────────────────────────────────
const mode = DISCOVER ? discover : INIT ? init : seed;
mode().catch((err) => {
  console.error('\nFAILED:', err.message || err);
  process.exit(1);
});
