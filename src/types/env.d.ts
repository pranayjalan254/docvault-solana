declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URL: string;
      // add other env variables here if needed
    }
  }
}

export {};
