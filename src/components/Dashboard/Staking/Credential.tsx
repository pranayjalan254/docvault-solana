import { CredentialModalProps } from "../Profile/CredentialModal/CredentialModal";

export interface Credential extends CredentialModalProps {
  id: string;
  publicKey?: string;
}
