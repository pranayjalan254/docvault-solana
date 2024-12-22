import ProjectUpload from '../models/ProjectUpload';

export const saveProjectUpload = async (
  credentialAccountPublicKey: string,
  pdfFile: File
): Promise<void> => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const projectUpload = new ProjectUpload({
      credentialAccountPublicKey,
      pdf: {
        data: buffer,
        contentType: pdfFile.type,
        filename: pdfFile.name
      }
    });

    await projectUpload.save();
    console.log('Project upload with PDF saved to MongoDB');
  } catch (error) {
    console.error('Error saving project upload:', error);
    throw error;
  }
};
