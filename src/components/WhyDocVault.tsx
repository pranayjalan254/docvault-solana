import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const Section = styled.section`
  padding: 100px 0;
  text-align: center;
`;

const Title = styled(motion.h2)`
  font-size: 48px;
  margin-bottom: 50px;
`;

const Features = styled.div`
  display: flex;
  justify-content: space-around;
`;

const FeatureCard = styled(motion.div)`
  width: 30%;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0px 10px 15px rgba(144, 202, 249, 0.5);
  }
`;

export const WhyDocVault: React.FC = () => {
  return (
    <Section>
      <Title
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Why DocVault?
      </Title>
      <Features>
        <FeatureCard whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
          <h3>Security</h3>
          <p>
            End-to-end encryption ensures that only you have access to your
            documents.
          </p>
        </FeatureCard>
        <FeatureCard whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
          <h3>Convenience</h3>
          <p>Access your documents from anywhere, anytime, on any device.</p>
        </FeatureCard>
        <FeatureCard whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
          <h3>Reliability</h3>
          <p>
            Decentralized storage ensures that your credentials are always
            available.
          </p>
        </FeatureCard>
      </Features>
    </Section>
  );
};
