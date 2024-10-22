import React from "react";
import { GlobalStyles } from "./styles/GlobalStyles";
import LandingPage from "./components/LandingPage/LandingPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./components/Authentication/Auth";

const App: React.FC = () => {
  return (
    <>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/" Component={LandingPage} />
          <Route path="/auth" Component={Auth} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
