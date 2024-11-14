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

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
  };

  const handleUploadCredentialsClick = () => {
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
          onClick={handleUploadCredentialsClick}
          className={activeSection === "Upload Credentials" ? "active" : ""}
        >
          Upload Credentials
          <Dropdown
            setActiveSection={handleSectionClick}
            isOpen={isDropdownOpen}
          />
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
