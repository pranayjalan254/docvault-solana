import React from "react";
import { motion } from "framer-motion";
import "./HeroSection.css";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, staggerChildren: 0.3 },
  },
};

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };
  return (
    <section className="hero-wrapper">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <h1 className="title">
          Empower Your Identity: The Future of Credential Management
        </h1>
        <p className="subtitle">Secure. Verified. Decentralized Credentials.</p>
      </motion.div>
      <motion.button
        className="get-started-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        onClick={handleGetStarted}
      >
        Get Started
      </motion.button>
    </section>
  );
};

export default HeroSection;
