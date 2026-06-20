export const CLOUDINARY = {
  cloudName:    'dgjxqjvbv',
  uploadPreset: 'ps_govindpur',
  baseUrl:      'https://api.cloudinary.com/v1_1/dgjxqjvbv/image/upload',
  // Delete endpoint + admin token come from env vars (a gitignored .env.local
  // locally, EAS env vars for builds) so they never land in this PUBLIC repo.
  // Set EXPO_PUBLIC_DELETE_ENDPOINT and EXPO_PUBLIC_ADMIN_TOKEN.
  deleteEndpoint: process.env.EXPO_PUBLIC_DELETE_ENDPOINT || '',
  adminToken:     process.env.EXPO_PUBLIC_ADMIN_TOKEN || '',
};

// Derive the Cloudinary public_id from a stored secure_url.
// e.g. https://res.cloudinary.com/dgjxqjvbv/image/upload/v1700/ps_govindpur/gallery/holi/01.jpg
//      -> ps_govindpur/gallery/holi/01
export const publicIdFromUrl = (url = '') => {
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return m ? m[1] : null;
};

// Ask OUR server to delete the asset from Cloudinary (signed, secret stays server-side).
// Returns true on success. Throws if no endpoint is configured.
export const deleteFromCloudinary = async (url) => {
  if (!CLOUDINARY.deleteEndpoint) {
    throw new Error('deleteEndpoint not configured');
  }
  const publicId = publicIdFromUrl(url);
  if (!publicId) throw new Error('Could not parse public_id from url');

  const res = await fetch(CLOUDINARY.deleteEndpoint, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': CLOUDINARY.adminToken || '',
    },
    body:    JSON.stringify({ publicId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.result !== 'ok') {
    throw new Error(data.error || `delete failed (${res.status})`);
  }
  return true;
};

export const uploadToCloudinary = async (imageUri, folder = 'general') => {
  const formData = new FormData();
  formData.append('file', {
    uri:  imageUri,
    type: 'image/jpeg',
    name: `${Date.now()}.jpg`,
  });
  formData.append('upload_preset', CLOUDINARY.uploadPreset);
  formData.append('folder', `ps_govindpur/${folder}`);

  const response = await fetch(CLOUDINARY.baseUrl, {
    method: 'POST',
    body:   formData,
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
};
