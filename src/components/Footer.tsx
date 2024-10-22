import React from "react";
import styled from "styled-components";

const FooterWrapper = styled.footer`
  padding: 30px 0;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
`;

const FooterText = styled.p`
  font-size: 14px;
  color: #fff;
`;

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <FooterText>© 2024 DocVault. All rights reserved.</FooterText>
    </FooterWrapper>
  );
};

export default Footer;
