import { readFileAsBase64 } from "./readFileAsBase64";

export const saveCredentialUpload = async (
  credentialType: "degree" | "project" | "skill" | "employment" | "certificate",
  credentialId: string,
  file: File | null
) => {
  try {
    if (!file) return null;

    const fileBase64 = await readFileAsBase64(file);

    const response = await fetch("/api/credentials/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        credentialType,
        credentialId,
        fileBase64,
        timestamp: new Date(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save ${credentialType}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error saving ${credentialType}:`, error);
    throw error;
  }
};
