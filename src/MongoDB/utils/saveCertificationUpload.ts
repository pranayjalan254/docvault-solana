import CertificationUpload from '../models/CertificationUpload';

export const saveCertificationUpload = async (
  credentialAccountPublicKey: string,
  pdfFile: File
): Promise<void> => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const certificationUpload = new CertificationUpload({
      credentialAccountPublicKey,
      pdf: {
        data: buffer,
        contentType: pdfFile.type,
        filename: pdfFile.name
      }
    });

    await certificationUpload.save();
    console.log('Certification upload with PDF saved to MongoDB');
  } catch (error) {
    console.error('Error saving certification upload:', error);
    throw error;
  }
};
