import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const SectionWrapper = styled.section`
  padding: 100px 0;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
`;

const Heading = styled.h2`
  font-size: 48px;
  margin-bottom: 40px;
  color: #fff;
`;

const CardsWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
  padding: 0 50px;
`;

const Card = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  width: 300px;
  padding: 30px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const IconWrapper = styled.div`
  font-size: 40px;
  margin-bottom: 20px;
  color: #00d1ff;
`;

const CardHeading = styled.h3`
  font-size: 24px;
  margin-bottom: 15px;
`;

const CardText = styled.p`
  font-size: 16px;
  color: #ddd;
`;

const spring = {
  type: "spring",
  damping: 10,
  stiffness: 100,
};

const WhyDocVault: React.FC = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <SectionWrapper id="why-docvault">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Heading>Why DocVault?</Heading>
        <CardsWrapper>
          <Card
            initial="hidden"
            whileInView="visible"
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{ duration: 0.3, delay: 0, ...spring }}
            variants={cardVariants}
          >
            <IconWrapper>🔒</IconWrapper>
            <CardHeading>Secure Blockchain Storage</CardHeading>
            <CardText>
              Your credentials are securely stored on the blockchain, ensuring
              data integrity and tamper-proof security.
            </CardText>
          </Card>

          <Card
            initial="hidden"
            whileInView="visible"
            whileHover={{ scale: 1.1, rotate: -2 }}
            transition={{ duration: 0.3, delay: 0.2, ...spring }}
            variants={cardVariants}
          >
            <IconWrapper>✅</IconWrapper>
            <CardHeading>Verifiable Credentials</CardHeading>
            <CardText>
              Verifiable and authentic credentials issued directly by trusted
              institutions and securely stored for access anytime.
            </CardText>
          </Card>

          <Card
            initial="hidden"
            whileInView="visible"
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{ duration: 0.3, delay: 0.4, ...spring }}
            variants={cardVariants}
          >
            <IconWrapper>⚙️</IconWrapper>
            <CardHeading>Decentralized Access</CardHeading>
            <CardText>
              Decentralized access to credentials across the globe with full
              control over who can view and verify them.
            </CardText>
          </Card>
        </CardsWrapper>
      </motion.div>
    </SectionWrapper>
  );
};

export default WhyDocVault;
