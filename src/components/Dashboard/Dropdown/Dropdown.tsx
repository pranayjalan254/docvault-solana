import React from "react";
import "./Dropdown.css";

interface DropdownProps {
  setActiveSection: (section: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ setActiveSection }) => {
  return (
    <ul className="dropdown-menu">
      <li onClick={() => setActiveSection("Degree")}>Degree</li>
      <li onClick={() => setActiveSection("Project")}>Project</li>
      <li onClick={() => setActiveSection("Skill")}>Skill</li>
      <li onClick={() => setActiveSection("Employment History")}>
        Employment History
      </li>
      <li onClick={() => setActiveSection("Certification")}>Certification</li>
    </ul>
  );
};

export default Dropdown;
