import nacl from "tweetnacl";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { authMiddleware } from "../middleware";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { PublicKey } from "@solana/web3.js";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.ACCESS_SECRET ?? "",
  },
  region: "us-east-1",
});

const router = Router();

const prismaClient = new PrismaClient();

prismaClient.$transaction(
  async (prisma) => {
    // Code running in a transaction...
  },
  {
    maxWait: 5000, // default: 2000
    timeout: 10000, // default: 5000
  }
);
// @ts-ignore
router.get("/presignedUrl", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: "hkirat-cms",
    Key: `pdfFiles/${userId}/${Math.random()}/file.txt`,
    Conditions: [
      ["content-length-range", 0, 500 * 1024 * 1024], // 500 MB max
    ],
    Expires: 3600,
  });

  res.json({
    preSignedUrl: url,
    fields,
  });
});
// @ts-ignore
router.post("/signin", async (req, res) => {
  const { publicKey, signature } = req.body;
  const message = new TextEncoder().encode("Sign into mechanical turks");

  const result = nacl.sign.detached.verify(
    message,
    new Uint8Array(signature.data),
    new PublicKey(publicKey).toBytes()
  );

  if (!result) {
    return res.status(411).json({
      message: "Incorrect signature",
    });
  }

  const existingUser = await prismaClient.user.findFirst({
    where: {
      address: publicKey,
    },
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } else {
    const user = await prismaClient.user.create({
      // @ts-ignore
      data: {
        address: publicKey,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  }
});

export default router;
