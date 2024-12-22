import express, { Request, Response, NextFunction } from "express";
import userRouter from "./routers/user";

import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/v1/user", userRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(3000, () => {
  console.log("Backend server running on port 3000");
});
