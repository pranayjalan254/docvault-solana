import React from "react";
import "./Dropdown.css";

interface DropdownProps {
  setActiveSection: (section: string) => void;
  isOpen: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ setActiveSection, isOpen }) => {
  if (!isOpen) return null;

  const handleItemClick = (e: React.MouseEvent, section: string) => {
    e.stopPropagation();
    setActiveSection(section);
  };

  return (
    <ul className="dropdown-menu">
      <li onClick={(e) => handleItemClick(e, "Degree")}>Degree</li>
      <li onClick={(e) => handleItemClick(e, "Project")}>Project</li>
      <li onClick={(e) => handleItemClick(e, "Skill")}>Skill</li>
      <li onClick={(e) => handleItemClick(e, "Employment History")}>
        Employment History
      </li>
      <li onClick={(e) => handleItemClick(e, "Certification")}>
        Certification
      </li>
    </ul>
  );
};

export default Dropdown;
