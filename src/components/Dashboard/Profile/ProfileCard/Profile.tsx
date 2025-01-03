import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import "./Profile.css";
import CredentialCard from "../CredentialCard/CredentialCard";
import { QRCodeCanvas } from "qrcode.react";
import { fetchAllCredentials } from "../../../../utils/credentialUtils";
import { toast } from "react-hot-toast";
import { CredentialModalProps as Credential } from "../CredentialModal/CredentialModal";
import { encryptPublicKey } from "../../../../utils/encryptionUtils";

interface UserProfile {
  _id?: string;
  name: string;
  username: string;
  email?: string;
  walletAddress: string;
}

const CACHE_DURATION = 5 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const Profile: React.FC = () => {
  const { publicKey, wallet } = useWallet();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLastFetchTime] = useState<number>(0);
  const [, setCachedCredentials] = useState<Credential[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    username: "",
    email: "",
    walletAddress: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getShareableLink = async () => {
    if (!publicKey) return "";
    const encryptedKey = await encryptPublicKey(publicKey.toString());
    return `${window.location.origin}/profile/${encryptedKey}`;
  };

  const copyToClipboard = async () => {
    try {
      const link = await getShareableLink();
      await navigator.clipboard.writeText(link);
      setCopyButtonText("Copied!");
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopyButtonText("Copy"), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  useEffect(() => {
    if (isShareModalOpen && publicKey) {
      getShareableLink().then(setShareableLink);
    }
  }, [isShareModalOpen, publicKey]);

  useEffect(() => {
    const fetchCredentialsWithRetry = async (retryCount = 0) => {
      if (!publicKey || !wallet) {
        setLoading(false);
        return;
      }

      // Check localStorage cache first
      const cachedData = localStorage.getItem(
        `credentials-${publicKey.toString()}`
      );
      if (cachedData) {
        const { credentials: cached, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setCredentials(cached);
          setCachedCredentials(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const connection = new Connection(
          `https://devnet.helius-rpc.com/?api-key=${
            import.meta.env.VITE_HELIUS_API_KEY
          }`,
          "confirmed"
        );
        const provider = new AnchorProvider(connection, wallet as any, {
          commitment: "confirmed",
        });

        const formattedCredentials = await fetchAllCredentials(
          publicKey,
          provider
        );

        // Store in localStorage
        localStorage.setItem(
          `credentials-${publicKey.toString()}`,
          JSON.stringify({
            credentials: formattedCredentials,
            timestamp: Date.now(),
          })
        );

        setError(null);
        setCredentials(formattedCredentials);
        setCachedCredentials(formattedCredentials);
        setLastFetchTime(Date.now());
      } catch (error) {
        console.error("Error fetching credentials:", error);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            fetchCredentialsWithRetry(retryCount + 1);
          }, RETRY_DELAY);
          return;
        }
        setError("Failed to load credentials. Please try refreshing the page.");
        setCredentials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentialsWithRetry();
  }, [publicKey, wallet]);

  useEffect(() => {
    if (publicKey) {
      setUserProfile((prev) => ({
        ...prev,
        walletAddress: publicKey.toString(),
      }));
      fetchUserProfile(publicKey.toString());
    }
  }, [publicKey]);

  const fetchUserProfile = async (walletAddress: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${walletAddress}`
      );
      if (response.ok) {
        const { user } = await response.json();
        setUserProfile(user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    setIsSubmitting(true);
    try {
      const url = `http://localhost:5000/api/users`;
      const method = userProfile._id ? "PUT" : "POST";
      const endpoint = userProfile._id ? `${url}/${publicKey.toString()}` : url;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userProfile.name,
          username: userProfile.username,
          email: userProfile.email,
          walletAddress: publicKey.toString(),
        }),
      });

      if (response.ok) {
        const { user } = await response.json();
        setUserProfile(user);
        toast.success("Profile updated successfully!");
        setIsProfileModalOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h2>
          {userProfile.name
            ? `Welcome, ${userProfile.name}`
            : "Your Uploaded Credentials"}
        </h2>
        {!userProfile.name && <p>Please configure your profile</p>}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="configure-profile-button"
            onClick={() => setIsProfileModalOpen(true)}
          >
            {userProfile._id ? "Update Profile" : "Configure Profile"}
          </button>
          <button
            className="share-button"
            onClick={() => setIsShareModalOpen(true)}
          >
            Share Profile
          </button>
        </div>
      </div>

      {/* Add Profile Configuration Modal */}
      {isProfileModalOpen && (
        <div
          className="profile-config-modal"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="profile-config-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Configure Profile</h3>
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label>Wallet Address</label>
                <input
                  type="text"
                  value={publicKey?.toString() || ""}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={userProfile.username}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={userProfile.email || ""}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="profile-config-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsProfileModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <QRCodeCanvas value={shareableLink} size={200} />
            </div>
            <div className="share-link">
              <input type="text" value={shareableLink} readOnly />
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
