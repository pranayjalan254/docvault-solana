import React, { useState } from "react";
import "./Sidebar.css";
import Dropdown from "../Dropdown/Dropdown";

interface SidebarProps {
  setActiveSection: (section: string) => void;
  activeSection: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  setActiveSection,
  activeSection,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <aside className="sidebar">
      <ul>
        <li
          onClick={() => setActiveSection("Profile")}
          className={activeSection === "Profile" ? "active" : ""}
        >
          Profile
        </li>

        <li
          onClick={handleDropdownToggle}
          className={activeSection === "Upload Credentials" ? "active" : ""}
        >
          Upload Credentials
          {isDropdownOpen && <Dropdown setActiveSection={setActiveSection} />}
        </li>

        <li
          onClick={() => setActiveSection("Staking")}
          className={activeSection === "Staking" ? "active" : ""}
        >
          Staking
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
