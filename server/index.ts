import express from 'express';
import cors from 'cors';
import multer from 'multer';
import connectDB from './MongoDB/connect';
import CredentialModel from './MongoDB/models/Credential';
import { Request, Response } from 'express';

const app = express();
const upload = multer();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

connectDB().catch(console.error);

// API endpoint for credential upload
app.post('/api/upload-credential', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, publicKey } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file provided' });
      return;
    }

    const credential = {
      credentialType: type,
      credentialAccountPublicKey: publicKey,
      pdf: {
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname
      }
    };

    const newCredential = await CredentialModel.create(credential);
    
    res.status(200).json({ success: true, id: newCredential._id });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to save credential' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
