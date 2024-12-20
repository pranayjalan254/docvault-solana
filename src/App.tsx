import React, { useMemo } from "react";
import { GlobalStyles } from "./styles/GlobalStyles";
import LandingPage from "./components/LandingPage/LandingPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthPage } from "./components/Authentication/Auth";
import Dashboard from "./components/Dashboard/Dashboard/Dashboard";
import ProtectedRoute from "../ProtectedRoute";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import "@solana/wallet-adapter-react-ui/styles.css";
import SharedProfile from "./components/Dashboard/Profile/SharedProfile/SharedProfile";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <>
      <GlobalStyles />
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:publicKeyStr"
                  element={<SharedProfile />}
                />
              </Routes>
            </Router>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <Toaster position="top-right" />
    </>
  );
};

export default App;
