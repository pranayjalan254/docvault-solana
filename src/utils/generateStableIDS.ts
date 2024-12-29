import { createHash } from "crypto";
import { CredentialModalProps as Credential } from "../components/Dashboard/Profile/CredentialModal/CredentialModal";

export function generateStableCredentialId(cred: Credential): string {
  const uniqueString = `${cred.type}-${cred.title}-${JSON.stringify(cred.details)}`;
  return createHash("sha256").update(uniqueString).digest("hex").slice(0, 16); 
}