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
const DRY = args.includes('--dry');

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
(DISCOVER ? discover() : seed()).catch((err) => {
  console.error('\nFAILED:', err.message || err);
  process.exit(1);
});
