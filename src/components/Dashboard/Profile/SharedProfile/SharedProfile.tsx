import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import CredentialCard from "../CredentialCard/CredentialCard";
import "../ProfileCard/Profile.css";
import { fetchAllCredentials } from "../../../../utils/credentialUtils";
import { CredentialModalProps as Credential } from "../CredentialModal/CredentialModal";
import { decryptPublicKey } from "../../../../utils/encryptionUtils";

const CACHE_DURATION = 5 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const SharedProfile: React.FC = () => {
  const { publicKeyStr: encryptedPublicKey } = useParams();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CREDENTIAL_SECTIONS = [
    { type: "Degree", title: "Educational Credentials" },
    { type: "Project", title: "Projects" },
    { type: "Skill", title: "Skills" },
    { type: "Employment History", title: "Employment History" },
    { type: "Certification", title: "Certifications" },
  ];

  useEffect(() => {
    const fetchCredentialsWithRetry = async (retryCount = 0) => {
      if (!encryptedPublicKey) {
        setLoading(false);
        setError("No profile key provided");
        return;
      }

      try {
        const decryptedPublicKey = await decryptPublicKey(encryptedPublicKey);
        if (!decryptedPublicKey) {
          throw new Error("Invalid profile link");
        }
        const cachedData = localStorage.getItem(
          `credentials-${decryptedPublicKey}`
        );
        if (cachedData) {
          const { credentials: cached, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setCredentials(cached);
            setLoading(false);
            return;
          }
        }

        const connection = new Connection(
          "https://api.devnet.solana.com",
          "confirmed"
        );

        try {
          const publicKey = new PublicKey(decryptedPublicKey);
          const provider = new AnchorProvider(connection, window as any, {
            commitment: "confirmed",
          });

          const formattedCredentials = await fetchAllCredentials(
            publicKey,
            provider
          );

          // Store in cache with decrypted key
          localStorage.setItem(
            `credentials-${decryptedPublicKey}`,
            JSON.stringify({
              credentials: formattedCredentials,
              timestamp: Date.now(),
            })
          );

          setCredentials(formattedCredentials);
          setError(null);
        } catch (e) {
          throw new Error("Invalid public key format");
        }
      } catch (error) {
        console.error("Error fetching credentials:", error);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            fetchCredentialsWithRetry(retryCount + 1);
          }, RETRY_DELAY);
          return;
        }
        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
        setCredentials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentialsWithRetry();
  }, [encryptedPublicKey]);

  if (loading) {
    return (
      <div className="profile-content fade-in">Loading credentials...</div>
    );
  }

  if (error) {
    return <div className="profile-content fade-in error-message">{error}</div>;
  }

  return (
    <div className="profile-content fade-in">
      <h2 className="profile-header">Profile</h2>
      <div className="credentials-sections">
        {CREDENTIAL_SECTIONS.map(({ type, title }) => {
          const sectionCredentials = credentials.filter(
            (cred) => cred.type === type
          );
          return (
            <section key={type} className="credential-section">
              <h3>{title}</h3>
              {sectionCredentials.length > 0 ? (
                <div className="credentials-grid">
                  {sectionCredentials.map((credential, index) => (
                    <CredentialCard
                      key={index}
                      {...credential}
                      isOpen={false}
                      onClose={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <p className="no-credentials">
                  No {title.toLowerCase()} available
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default SharedProfile;
