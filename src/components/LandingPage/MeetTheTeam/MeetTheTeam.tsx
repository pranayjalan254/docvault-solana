import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import "./MeetTheTeam.css"; // Import the CSS file

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, staggerChildren: 0.3 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const MeetTheTeam: React.FC = () => {
  // Use ref to track the section
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section className="TeamWrapper" ref={ref} id="meet-the-team">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <h2 className="Heading">Meet the Team</h2>

        <div className="TeamGrid">
          <motion.div variants={childVariants}>
            <motion.div
              className="Card"
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <img className="Avatar" src="/pranay.jpg" alt="Pranay Jalan" />
              <h3 className="Name">Pranay Jalan</h3>
              <p className="Position">Full Stack Developer</p>
              <div className="SocialIcons">
                <a
                  className="IconLink"
                  href="https://github.com/pranay"
                  target="_blank"
                >
                  <FaGithub />
                </a>
                <a
                  className="IconLink"
                  href="https://linkedin.com/in/pranay"
                  target="_blank"
                >
                  <FaLinkedin />
                </a>
                <a
                  className="IconLink"
                  href="https://twitter.com/pranay"
                  target="_blank"
                >
                  <FaTwitter />
                </a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={childVariants}>
            <motion.div
              className="Card"
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <img className="Avatar" src="/anmol.jpg" alt="Anmol Agrawal" />
              <h3 className="Name">Anmol Agrawal</h3>
              <p className="Position">Smart Contract Developer</p>
              <div className="SocialIcons">
                <a
                  className="IconLink"
                  href="https://github.com/anmol"
                  target="_blank"
                >
                  <FaGithub />
                </a>
                <a
                  className="IconLink"
                  href="https://linkedin.com/in/anmol"
                  target="_blank"
                >
                  <FaLinkedin />
                </a>
                <a
                  className="IconLink"
                  href="https://twitter.com/anmol"
                  target="_blank"
                >
                  <FaTwitter />
                </a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={childVariants}>
            <motion.div
              className="Card"
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <img className="Avatar" src="/ansh.jpg" alt="Ansh Nohria" />
              <h3 className="Name">Ansh Nohria</h3>
              <p className="Position">Smart Contract Developer</p>
              <div className="SocialIcons">
                <a
                  className="IconLink"
                  href="https://github.com/ansh"
                  target="_blank"
                >
                  <FaGithub />
                </a>
                <a
                  className="IconLink"
                  href="https://linkedin.com/in/ansh"
                  target="_blank"
                >
                  <FaLinkedin />
                </a>
                <a
                  className="IconLink"
                  href="https://twitter.com/ansh"
                  target="_blank"
                >
                  <FaTwitter />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default MeetTheTeam;
