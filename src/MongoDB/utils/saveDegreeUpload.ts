import DegreeUpload from '../models/DegreeUpload';

export const saveDegreeUpload = async (
  credentialAccountPublicKey: string,
  pdfFile: File
): Promise<void> => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const degreeUpload = new DegreeUpload({
      credentialAccountPublicKey,
      pdf: {
        data: buffer,
        contentType: pdfFile.type,
        filename: pdfFile.name
      }
    });

    await degreeUpload.save();
    console.log('Degree upload with PDF saved to MongoDB');
  } catch (error) {
    console.error('Error saving degree upload:', error);
    throw error;
  }
};
