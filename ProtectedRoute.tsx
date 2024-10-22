import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  useEffect(() => {
    if (!publicKey) {
      navigate("/auth");
    }
  }, [publicKey, navigate]);

  return publicKey ? <>{children}</> : null;
};

export default ProtectedRoute;
