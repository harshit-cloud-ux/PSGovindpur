export const CLOUDINARY = {
  cloudName:    'dgjxqjvbv',
  uploadPreset: 'ps_govindpur',
  baseUrl:      'https://api.cloudinary.com/v1_1/dgjxqjvbv/image/upload',
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
