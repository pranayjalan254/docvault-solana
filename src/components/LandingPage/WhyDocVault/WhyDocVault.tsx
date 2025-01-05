import React from "react";
import { motion } from "framer-motion";
import "./WhyDocVault.css";

const WhyDocVault: React.FC = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="section-wrapper" id="why-docvault">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="heading">Why DocVault?</h2>
        <div className="cards-wrapper">
          <motion.div
            className="card"
            initial="hidden"
            whileInView="visible"
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{
              duration: 0.3,
              delay: 0,
              type: "spring",
              damping: 10,
              stiffness: 100,
            }}
            variants={cardVariants}
          >
            <div className="icon-wrapper">🔒</div>
            <h3 className="card-heading">Secure Blockchain Storage</h3>
            <p className="card-text">
              Your credentials are securely stored on the blockchain, ensuring
              data integrity and tamper-proof security.
            </p>
          </motion.div>

          <motion.div
            className="card"
            initial="hidden"
            whileInView="visible"
            whileHover={{ scale: 1.1, rotate: -2 }}
            transition={{
              duration: 0.3,
              delay: 0.2,
              type: "spring",
              damping: 10,
              stiffness: 100,
            }}
            variants={cardVariants}
          >
            <div className="icon-wrapper">✅</div>
            <h3 className="card-heading">Verifiable Credentials</h3>
            <p className="card-text">
              Empower your credentials with peer-to-peer verification.
            </p>
          </motion.div>

          <motion.div
            className="card"
            initial="hidden"
            whileInView="visible"
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{
              duration: 0.3,
              delay: 0.4,
              type: "spring",
              damping: 10,
              stiffness: 100,
            }}
            variants={cardVariants}
          >
            <div className="icon-wrapper">⚙️</div>
            <h3 className="card-heading">Share Your Profile</h3>
            <p className="card-text">
              Share your verified profile or the QR code to anyone with a click
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default WhyDocVault;
