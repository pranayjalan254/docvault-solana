import React from "react";
import styled from "styled-components";

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 20px;
`;

const NavLink = styled.li`
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #90caf9;
  }
`;

export const Navbar: React.FC = () => {
  return (
    <NavbarContainer>
      <Logo>DocVault</Logo>
      <NavLinks>
        <NavLink>Home</NavLink>
        <NavLink>Why DocVault?</NavLink>
        <NavLink>Meet the Team</NavLink>
      </NavLinks>
    </NavbarContainer>
  );
};
