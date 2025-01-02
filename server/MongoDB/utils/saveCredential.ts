export async function saveCredentialUpload(
  type: "Skill" | "Degree" | "Employment" | "Project" | "Certification",
  publicKey: string,
  file?: File,
  proofLink?: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("publicKey", publicKey);
    if (file) {
      formData.append("file", file);
    }
    if (proofLink) {
      formData.append("proofLink", proofLink);
    }

    const response = await fetch(
      "https://docvault.onrender.com/api/upload-credential",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload credential");
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error saving credential:", error);
    throw error;
  }
}
