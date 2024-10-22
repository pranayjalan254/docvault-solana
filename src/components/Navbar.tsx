import React from "react";
import styled from "styled-components";
import { FaHome, FaInfoCircle, FaUsers } from "react-icons/fa";
import { Link } from "react-scroll";

const NavbarWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 5px rgba(173, 216, 230, 0.5); /* Light blue (LightSkyBlue) */
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.h1`
  font-size: 24px;
  color: #fff;
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 20px;
`;

const NavLink = styled.li`
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #9c27b0;
  }
`;

const Navbar: React.FC = () => {
  return (
    <NavbarWrapper>
      <Logo>DocVault</Logo>
      <NavLinks>
        <NavLink>
          <Link to="home" smooth={true} duration={500} spy={true} offset={-70}>
            <FaHome /> Home
          </Link>
        </NavLink>
        <NavLink>
          <Link
            to="why-docvault"
            smooth={true}
            duration={500}
            spy={true}
            offset={-70}
          >
            <FaInfoCircle /> Why DocVault
          </Link>
        </NavLink>
        <NavLink>
          <Link
            to="meet-the-team"
            smooth={true}
            duration={500}
            spy={true}
            offset={-70}
          >
            <FaUsers /> Meet the Team
          </Link>
        </NavLink>
      </NavLinks>
    </NavbarWrapper>
  );
};

export default Navbar;
