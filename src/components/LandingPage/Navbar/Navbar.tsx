import React from "react";
import "./Navbar.css";
const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <h1 className="logo">DocVault</h1>
      <button className="login-button">Login</button>
    </nav>
  );
};

export default Navbar;
