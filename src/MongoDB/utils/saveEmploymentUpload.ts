import EmploymentUpload from '../models/EmploymentUpload';

export const saveEmploymentUpload = async (
  credentialAccountPublicKey: string,
  pdfFile: File
): Promise<void> => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const employmentUpload = new EmploymentUpload({
      credentialAccountPublicKey,
      pdf: {
        data: buffer,
        contentType: pdfFile.type,
        filename: pdfFile.name
      }
    });

    await employmentUpload.save();
    console.log('Employment upload with PDF saved to MongoDB');
  } catch (error) {
    console.error('Error saving employment upload:', error);
    throw error;
  }
};
