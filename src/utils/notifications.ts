type NotificationType = "success" | "error" | "info";

interface NotifyProps {
  type: NotificationType;
  message: string;
  txid?: string;
}

export const notify = ({ type, message, txid }: NotifyProps) => {
  // You can implement this using your preferred notification library
  // For example: react-toastify, react-hot-toast, etc.

  if (txid) {
    const explorerLink = `https://explorer.solana.com/tx/${txid}?cluster=devnet`;
    message += ` View on Explorer: ${explorerLink}`;
  }

  switch (type) {
    case "success":
      console.log("Success:", message);
      break;
    case "error":
      console.error("Error:", message);
      break;
    case "info":
      console.info("Info:", message);
      break;
  }
};
