export const uploadPdf = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(process.env.UPLOAD_ENDPOINT || '/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('PDF upload error:', error);
    throw new Error('Failed to upload PDF');
  }
};
