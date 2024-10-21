import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const HeroWrapper = styled.section`
  height: 100vh; /* Full viewport height */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative; /* Allow positioning of children */
  z-index: 1; /* Bring content above the video */
`;

const Title = styled.h1`
  font-size: 64px;
  margin-bottom: 20px;
  color: #fff; /* White text */
`;

const Subtitle = styled.p`
  font-size: 24px;
  margin-bottom: 40px;
  color: #ddd; /* Light grey text */
`;

const Button = styled(motion.button)`
  padding: 15px 30px;
  font-size: 18px;
  color: #fff;
  background: linear-gradient(135deg, #00d1ff, #006fbb);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0px 4px 15px rgba(0, 209, 255, 0.5);

  &:hover {
    background: linear-gradient(135deg, #00b5e2, #005f99);
    box-shadow: 0px 6px 20px rgba(0, 209, 255, 0.8);
    transform: translateY(-5px); /* Lift effect */
  }

  &:active {
    transform: translateY(0); /* Pressed effect */
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
      {/* Title and Subtitle with auto-render on scroll */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }} /* Auto-render animations */
        variants={containerVariants}
      >
        <Title>Welcome to DocVault</Title>
        <Subtitle>Secure. Verified. Decentralized Credentials.</Subtitle>
      </motion.div>

      {/* Get Started Button with hover effects */}
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
