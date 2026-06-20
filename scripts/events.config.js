/**
 * Gallery event metadata.
 *
 * Cloudinary holds the PHOTOS (auto-discovered by the seed script).
 * This file holds everything Cloudinary does NOT know about:
 *   - the Hindi title shown on the card
 *   - display order
 *   - the Google Photos "view all" album link
 *   - YouTube video links
 *
 * HOW TO FILL `folder`:
 *   Run `node seedGallery.mjs --discover` once. It prints every sub-folder
 *   under ps_govindpur/gallery with its image count. Copy the exact folder
 *   name into the matching event's `folder` field below.
 *
 * Any event whose `folder` is still '' will be SKIPPED by the seeder, so you
 * can seed in batches as you finish uploading each album.
 */

export default [
  { order: 1,  title: 'प्रातः कालीन प्रार्थना सत्र',                         folder: '', photosAlbumUrl: '', videos: [] },
  { order: 2,  title: 'सांयकालीन बाल सभा',                                  folder: '', photosAlbumUrl: '', videos: [] },
  { order: 3,  title: 'प्रेरणादाई मध्यान भोजन सत्र',                          folder: '', photosAlbumUrl: '', videos: [] },
  { order: 4,  title: 'स्वतंत्रता दिवस 2025',                                folder: '', photosAlbumUrl: '', videos: [] },
  { order: 5,  title: 'गणतंत्र दिवस समारोह 2026',                           folder: '', photosAlbumUrl: '', videos: [] },
  { order: 6,  title: 'विद्यालय वार्षिकोत्सव 2026',                          folder: '', photosAlbumUrl: '', videos: [] },
  { order: 7,  title: 'स्कूल चलो अभियान',                                    folder: '', photosAlbumUrl: '', videos: [] },
  { order: 8,  title: 'खेलकूद प्रतियोगिताएं',                                 folder: '', photosAlbumUrl: '', videos: [] },
  { order: 9,  title: 'शिक्षक अभिभावक संगोष्ठी',                             folder: '', photosAlbumUrl: '', videos: [] },
  { order: 10, title: 'एक पेड़ मां के नाम कार्यक्रम',                         folder: '', photosAlbumUrl: '', videos: [] },
  { order: 11, title: 'होली कार्यक्रम 2026',                                folder: '', photosAlbumUrl: '', videos: [] },
  { order: 12, title: 'बीएसए महोदय का विद्यालय भ्रमण 2025',                folder: '', photosAlbumUrl: '', videos: [] },
  { order: 13, title: 'हिंदू नव वर्ष चैत्र प्रतिपदा उत्सव 2026',             folder: '', photosAlbumUrl: '', videos: [] },
  { order: 14, title: 'नामांकन मेला 2026',                                  folder: '', photosAlbumUrl: '', videos: [] },
  { order: 15, title: 'फेयरवेल कार्यक्रम 2026',                             folder: '', photosAlbumUrl: '', videos: [] },
  { order: 16, title: 'स्मार्ट क्लास उद्घाटन',                               folder: '', photosAlbumUrl: '', videos: [] },
  { order: 17, title: 'विद्यार्थी जन्मदिवस',                                 folder: '', photosAlbumUrl: '', videos: [] },
  { order: 18, title: 'विद्यारंभ सत्र 2026-27',                             folder: '', photosAlbumUrl: '', videos: [] },
  { order: 19, title: 'कथावाचक सुश्री चारु चर्चिका कार्यक्रम 2026',          folder: '', photosAlbumUrl: '', videos: [] },
  { order: 20, title: 'कविताएं',                                            folder: '', photosAlbumUrl: '', videos: [] },
  { order: 21, title: 'अन्य कार्यक्रम',                                      folder: '', photosAlbumUrl: '', videos: [] },
  { order: 22, title: 'सुर्खियों में गोविंदपुर',                              folder: '', photosAlbumUrl: '', videos: [] },
];

/**
 * Example of a fully-filled event:
 *
 * {
 *   order: 4,
 *   title: 'स्वतंत्रता दिवस 2025',
 *   folder: 'independence-day-2025',           // <- exact Cloudinary sub-folder name
 *   photosAlbumUrl: 'https://photos.app.goo.gl/abc123',  // Google Photos album
 *   videos: [
 *     { title: 'झंडारोहण समारोह', url: 'https://youtu.be/XXXXXXXXXXX' },
 *   ],
 * }
 */
