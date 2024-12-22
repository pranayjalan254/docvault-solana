import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { IDL } from "../components/Dashboard/UploadCredentials/uploadidl";
import { CredentialModalProps as Credential } from "../components/Dashboard/Profile/CredentialModal/CredentialModal";

const programId = new PublicKey("AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1");
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getStatusString = (status: any) => {
  if (status?.verified) return "Verified";
  if (status?.rejected) return "Rejected";
  return "Pending";
};

export const fetchUnverifiedCredentials = async (
  provider: AnchorProvider
): Promise<Credential[]> => {
  const program = new Program(IDL as any, programId, provider);
  let credentials: Credential[] = [];

  // Fetch degrees with error handling
  try {
    const degrees = await program.account.userDegreeCredential.all();
    await delay(2000);
    
    const degreeCredentials = (degrees || [])
      .filter((d: any) => d?.account && !d.account.status.verified && !d.account.status.rejected)
      .map((d: any) => ({
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
      }));
    credentials = [...credentials, ...degreeCredentials];
  } catch (error) {
    console.error("Error fetching degree credentials:", error);
  }

  // Fetch employments with error handling
  try {
    const employments = await program.account.employmentCredential.all();
    await delay(2000);
    
    const employmentCredentials = (employments || [])
      .filter((e: any) => e?.account && !e.account.status.verified && !e.account.status.rejected)
      .map((e: any) => {
        const startDate = new Date(e.account.startDate.toNumber() * 1000).toLocaleDateString();
        let endDateStr = "Present";
        
        // Only try to access endDate if it exists
        if (e.account.endDate) {
          try {
            endDateStr = new Date(e.account.endDate.toNumber() * 1000).toLocaleDateString();
          } catch (err) {
            console.error("Error parsing end date:", err);
          }
        }
        
        return {
          type: "Employment History",
          title: e.account.jobTitle,
          dateIssued: `${startDate} - ${endDateStr}`,
          status: getStatusString(e.account.status),
          details: {
            company: e.account.companyName,
            position: e.account.jobTitle,
          },
        };
      });
    credentials = [...credentials, ...employmentCredentials];
  } catch (error) {
    console.error("Error fetching employment credentials:", error);
  }

  return credentials;
};