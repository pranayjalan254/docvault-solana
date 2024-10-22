import React from "react";
import { GlobalStyles } from "./styles/GlobalStyles";
import LandingPage from "./components/LandingPage/LandingPage";

const App: React.FC = () => {
  return (
    <>
      <GlobalStyles />
      <LandingPage />
    </>
  );
};

export default App;
