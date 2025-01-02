import express from "express";
import cors from "cors";
import multer from "multer";
import connectDB from "./MongoDB/connect";
import CredentialModel from "./MongoDB/models/Credential";
import { Request, Response } from "express";

const app = express();
const upload = multer();

const allowedOrigins = [
  "http://localhost:5173",
  "https://docvault-solana.vercel.app",
  "https://www.docvault.website/",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

connectDB().catch(console.error);

// API endpoint for credential upload
app.post(
  "/api/upload-credential",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, publicKey: credentialId, proofLink } = req.body;
      const file = req.file;

      if (!file && !proofLink) {
        res.status(400).json({
          success: false,
          error: "Either file or proof link must be provided",
        });
        return;
      }

      const credential = {
        credentialType: type,
        credentialId,
        ...(file && {
          pdf: {
            data: file.buffer,
            contentType: file.mimetype,
            filename: file.originalname,
          },
        }),
        ...(proofLink && { proofLink }),
      };

      const newCredential = await CredentialModel.create(credential);

      res.status(200).json({ success: true, id: newCredential._id });
    } catch (error) {
      console.error("API Error:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to save credential" });
    }
  }
);

// Endpoint to fetch credential proof
app.get(
  "/api/credential-proof/:credentialId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const credential = await CredentialModel.findOne({
        credentialId: req.params.credentialId,
      });

      if (!credential) {
        res.status(404).json({ success: false, error: "Credential not found" });
        return;
      }

      if (credential.pdf?.data) {
        res.set("Content-Type", credential.pdf.contentType);
        res.set(
          "Content-Disposition",
          `inline; filename="${credential.pdf.filename}"`
        );
        res.send(credential.pdf.data);
        return;
      }

      if (credential.proofLink) {
        res.json({
          success: true,
          type: "link",
          proofLink: credential.proofLink,
        });
        return;
      }

      res.status(404).json({ success: false, error: "No proof available" });
    } catch (error) {
      console.error("Error fetching proof:", error);
      res.status(500).json({ success: false, error: "Failed to fetch proof" });
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
