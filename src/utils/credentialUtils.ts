import { PublicKey, Connection } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { IDL } from "../components/Dashboard/UploadCredentials/uploadidl";

const programId = new PublicKey("apwW9Vqxtu4Ga2dQ4R91jyYtWZ9HUFtx13MmPPfwLEb");
import { CredentialModalProps as Credential } from "../components/Dashboard/Profile/CredentialModal/CredentialModal";

// RPC endpoints
const RPC_ENDPOINTS = [
  "https://api.devnet.solana.com",
  `https://devnet.helius-rpc.com/?api-key=${
    import.meta.env.VITE_HELIUS_API_KEY
  }`,
  `https://cosmopolitan-rough-flower.solana-devnet.quiknode.pro/${
    import.meta.env.VITE_QUICKNODE_API_KEY
  }`,
];

let currentEndpointIndex = 0;
const CACHE_DURATION = 0.5 * 60 * 1000;
const credentialCache = new Map<
  string,
  { data: Credential[]; timestamp: number }
>();

const getNextEndpoint = () => {
  currentEndpointIndex = (currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
  return RPC_ENDPOINTS[currentEndpointIndex];
};

const getStatusString = (status: any) => {
  if (status?.verified) return "Verified";
  if (status?.rejected) return "Rejected";
  return "Pending";
};

export const fetchAllCredentials = async (
  publicKey: PublicKey,
  provider: AnchorProvider
): Promise<Credential[]> => {
  // Check cache
  const cacheKey = publicKey.toString();
  const cached = credentialCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Use a different endpoint for each request
    const connection = new Connection(getNextEndpoint());
    const newProvider = new AnchorProvider(connection, provider.wallet, {
      commitment: "confirmed",
    });
    const program = new Program(IDL as any, programId, newProvider);

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const degrees = await program.account.userDegreeCredential.all([
      { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
    ]);
    await delay(500);

    const skills = await program.account.skillCredential.all([
      { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
    ]);
    await delay(500);

    const employments = await program.account.employmentCredential.all([
      { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
    ]);
    await delay(500);

    const certificates = await program.account.certificateCredential.all([
      { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
    ]);
    await delay(500);

    const projects = await program.account.projectCredential.all([
      { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
    ]);

    const credentials = [
      ...degrees.map((d: any) => ({
        type: "Degree",
        title: d.account.degreeName,
        dateIssued: new Date(
          d.account.timestamp.toNumber() * 1000
        ).toLocaleDateString(),
        status: getStatusString(d.account.status),
        details: {
          university: d.account.collegeName,
          passoutYear: d.account.passoutYear?.toString() || "N/A",
        },
      })),
      ...projects.map((p: any) => ({
        type: "Project",
        title: p.account.projectName,
        dateIssued: new Date(p.account.timestamp * 1000).toLocaleDateString(),
        status: getStatusString(p.account.status),
        details: {
          projectUrl: p.account.projectLink,
          description: p.account.projectDescription,
        },
      })),
      ...skills.map((s: any) => ({
        type: "Skill",
        title: s.account.skillName,
        dateIssued: new Date(
          s.account.timestamp.toNumber() * 1000
        ).toLocaleDateString(),
        status: getStatusString(s.account.status),
        details: {
          skillLevel: s.account.proficiencyLevel?.toString(),
          description: s.account.proofLink,
        },
      })),
      ...employments.map((e: any) => ({
        type: "Employment History",
        title: e.account.jobTitle,
        dateIssued: `${new Date(
          e.account.startDate.toNumber() * 1000
        ).toLocaleDateString()} - ${
          e.account.currentlyWorking
            ? "Present"
            : e.account.endDate
            ? new Date(e.account.endDate.toNumber() * 1000).toLocaleDateString()
            : "N/A"
        }`,
        status: getStatusString(e.account.status),
        details: {
          company: e.account.companyName,
          position: e.account.jobTitle,
        },
      })),
      ...certificates.map((c: any) => ({
        type: "Certification",
        title: c.account.certificationName,
        dateIssued: new Date(
          c.account.dateOfIssue.toNumber() * 1000
        ).toLocaleDateString(),
        status: getStatusString(c.account.status),
        details: {
          certificationProvider: c.account.issuer,
          description: c.account.proofLink || "N/A",
        },
      })),
    ];

    // Cache the results
    credentialCache.set(cacheKey, {
      data: credentials,
      timestamp: Date.now(),
    });

    return credentials;
  } catch (error) {
    console.error("Error fetching credentials:", error);
    throw error;
  }
};
