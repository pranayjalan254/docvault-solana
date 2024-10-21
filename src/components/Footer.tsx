import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  padding: 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
`;

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <p>© 2024 DocVault. All rights reserved.</p>
    </FooterContainer>
  );
};
