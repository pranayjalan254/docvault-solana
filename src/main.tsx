import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Buffer } from "buffer";
import process from "process";
import connectDB from "./MongoDB/connect";
import mongoose from "mongoose";

// Make `Buffer` and `process` available globally
window.Buffer = Buffer;
window.process = process;

// Connect to MongoDB
connectDB();

// Handle graceful shutdown
const shutdown = () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
