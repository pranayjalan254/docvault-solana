export async function saveCredentialUpload(
  type: 'Skill' | 'Degree' | 'Employment' | 'Project' | 'Certification',
  publicKey: string,
  file: File
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('publicKey', publicKey);
    formData.append('file', file);

    const response = await fetch('http://localhost:5000/api/upload-credential', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload credential');
    }

    const data = await response.json();
    return data.id;

  } catch (error) {
    console.error('Error saving credential:', error);
    throw error;
  }
}
