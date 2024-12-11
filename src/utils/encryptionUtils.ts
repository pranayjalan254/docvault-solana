const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export const encryptPublicKey = async (publicKey: string): Promise<string> => {
  try {
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(publicKey)
    );
    const salt = new Uint8Array(hashBuffer).slice(0, 16);

    const iv = new Uint8Array(12);
    const hashForIV = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(publicKey + ENCRYPTION_KEY)
    );
    iv.set(new Uint8Array(hashForIV).slice(0, 12));

    const encoder = new TextEncoder();
    const data = encoder.encode(publicKey);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ENCRYPTION_KEY),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(
      salt.length + iv.length + encryptedArray.length
    );
    combined.set(salt);
    combined.set(iv, salt.length);
    combined.set(encryptedArray, salt.length + iv.length);

    return btoa(String.fromCharCode(...combined))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
};

export const decryptPublicKey = async (encrypted: string): Promise<string> => {
  try {
    const combined = new Uint8Array(
      atob(encrypted.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((char) => char.charCodeAt(0))
    );

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(ENCRYPTION_KEY),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Invalid or corrupted profile link");
  }
};
