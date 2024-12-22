import SkillUpload from '../models/SkillUpload';

export const saveSkillUpload = async (
  credentialAccountPublicKey: string,
  pdfFile: File
): Promise<void> => {
  try {
    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const skillUpload = new SkillUpload({
      credentialAccountPublicKey,
      pdf: {
        data: buffer,
        contentType: pdfFile.type,
        filename: pdfFile.name
      }
    });

    await skillUpload.save();
    console.log('Skill upload with PDF saved to MongoDB');
  } catch (error) {
    console.error('Error saving skill upload:', error);
    throw error;
  }
};
