import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import "./Profile.css";
import CredentialCard from "../CredentialCard/CredentialCard";
import { QRCodeCanvas } from "qrcode.react";
import {
  fetchAllCredentials,
  Credential,
} from "../../../../utils/credentialUtils";
import { toast } from "react-hot-toast";

const CACHE_DURATION = 60000;

const Profile: React.FC = () => {
  const { publicKey, wallet } = useWallet();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cachedCredentials, setCachedCredentials] = useState<Credential[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy");

  const getShareableLink = () => {
    if (!publicKey) return "";
    return `${window.location.origin}/profile/${publicKey.toString()}`;
  };

  const copyToClipboard = async () => {
    const link = getShareableLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopyButtonText("Copied!");
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopyButtonText("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!publicKey || !wallet) {
        setLoading(false);
        return;
      }

      // Check cache
      const now = Date.now();
      if (
        now - lastFetchTime < CACHE_DURATION &&
        cachedCredentials.length > 0
      ) {
        setCredentials(cachedCredentials);
        setLoading(false);
        return;
      }

      try {
        const connection = new Connection(
          "https://api.devnet.solana.com",
          "confirmed"
        );
        const provider = new AnchorProvider(connection, wallet as any, {
          commitment: "confirmed",
        });

        const formattedCredentials = await fetchAllCredentials(
          publicKey,
          provider
        );

        setError(null);
        setCredentials(formattedCredentials);
        setCachedCredentials(formattedCredentials);
        setLastFetchTime(Date.now());
      } catch (error) {
        console.error("Error fetching credentials:", error);
        setError("Failed to load credentials. Please try refreshing the page.");
        setCredentials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [publicKey, wallet, lastFetchTime, cachedCredentials]);

  const CREDENTIAL_SECTIONS = [
    { type: "Degree", title: "Educational Credentials" },
    { type: "Project", title: "Projects" },
    { type: "Skill", title: "Skills" },
    { type: "Employment History", title: "Employment History" },
    { type: "Certification", title: "Certifications" },
  ];

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
      <div className="profile-header">
        <h2>Your Uploaded Credentials</h2>
        <button
          className="share-button"
          onClick={() => setIsShareModalOpen(true)}
        >
          Share Profile
        </button>
      </div>

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
                    <CredentialCard key={index} {...credential} />
                  ))}
                </div>
              ) : (
                <p className="no-credentials">
                  No {title.toLowerCase()} available! Upload Now!
                </p>
              )}
            </section>
          );
        })}
      </div>

      {isShareModalOpen && (
        <div className="share-modal" onClick={() => setIsShareModalOpen(false)}>
          <div
            className="share-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Share Your Profile</h3>
            <div className="qr-code">
              <QRCodeCanvas value={getShareableLink()} size={200} />
            </div>
            <div className="share-link">
              <input type="text" value={getShareableLink()} readOnly />
              <button onClick={copyToClipboard}>{copyButtonText}</button>
            </div>
            <button
              className="close-button"
              onClick={() => setIsShareModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
