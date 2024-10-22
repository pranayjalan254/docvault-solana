import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const HeroWrapper = styled.section`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(black, #0d0d0d);
  position: relative; /* Allow positioning of children */
  z-index: 1; /* Bring content above the video */
`;

const Title = styled.h1`
  font-size: 54px;
  margin-bottom: 20px;
  padding-right: 270px;
  padding-left: 270px;
  text-align: center;
  font-weight: 400;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.5)
  );
  -webkit-background-clip: text;
  color: transparent;
  display: inline-block;
`;

const Subtitle = styled.p`
  font-size: 24px;
  margin-bottom: 40px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.5)
  );
  -webkit-background-clip: text;
  color: transparent;
  display: inline-block;
`;

const Button = styled(motion.button)`
  padding: 15px 30px;
  font-size: 18px;
  color: #ffffff;
  background: linear-gradient(135deg, #ff4081, #c51162);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  box-shadow: 0px 4px 15px rgba(255, 64, 129, 0.5);

  &:hover {
    background: linear-gradient(135deg, #9c27b0, #6a1b9a);
    box-shadow: 0px 6px 20px rgba(156, 39, 176, 0.8);
    transform: translateY(-5px) scale(1.05);
  }

  &:active {
    transform: translateY(0) scale(1); /* Reset scaling when pressed */
  }
`;

const containerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, staggerChildren: 0.3 },
  },
};

const HeroSection: React.FC = () => {
  return (
    <HeroWrapper>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <Title>
          Empower Your Identity: The Future of Credential Management
        </Title>
        <Subtitle>Secure. Verified. Decentralized Credentials.</Subtitle>
      </motion.div>
      <Button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Get Started
      </Button>
    </HeroWrapper>
  );
};

export default HeroSection;
