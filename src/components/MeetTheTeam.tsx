import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import styled from "styled-components";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa"; // Importing icons

const TeamWrapper = styled.section`
  padding: 100px 0;
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const Heading = styled.h2`
  font-size: 48px;
  margin-bottom: 60px;
  color: #fff;
`;

const TeamGrid = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
`;

const Card = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15px;
  width: 250px;
  padding: 20px;
  text-align: center;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px) scale(1.05);
  }
`;

const Avatar = styled.img`
  border-radius: 50%;
  width: 120px;
  height: 120px;
  margin-bottom: 15px;
  border: 4px solid #00d1ff;
`;

const Name = styled.h3`
  margin-bottom: 10px;
  font-size: 22px;
  color: #fff;
`;

const Position = styled.p`
  font-size: 16px;
  color: #ddd;
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
`;

const IconLink = styled.a`
  color: #fff;
  font-size: 20px;
  transition: color 0.3s ease;

  &:hover {
    color: #00d1ff;
  }
`;

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
    <TeamWrapper ref={ref} id="meet-the-team">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <Heading>Meet the Team</Heading>

        <TeamGrid>
          <motion.div variants={childVariants}>
            <Card
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <Avatar src="/pranay.jpg" alt="Pranay Jalan" />
              <Name>Pranay Jalan</Name>
              <Position>Full Stack Developer</Position>
              <SocialIcons>
                <IconLink href="https://github.com/pranay" target="_blank">
                  <FaGithub />
                </IconLink>
                <IconLink href="https://linkedin.com/in/pranay" target="_blank">
                  <FaLinkedin />
                </IconLink>
                <IconLink href="https://twitter.com/pranay" target="_blank">
                  <FaTwitter />
                </IconLink>
              </SocialIcons>
            </Card>
          </motion.div>

          <motion.div variants={childVariants}>
            <Card
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <Avatar src="/anmol.jpg" alt="Anmol Agrawal" />
              <Name>Anmol Agrawal</Name>
              <Position>Smart Contract Developer</Position>
              <SocialIcons>
                <IconLink href="https://github.com/anmol" target="_blank">
                  <FaGithub />
                </IconLink>
                <IconLink href="https://linkedin.com/in/anmol" target="_blank">
                  <FaLinkedin />
                </IconLink>
                <IconLink href="https://twitter.com/anmol" target="_blank">
                  <FaTwitter />
                </IconLink>
              </SocialIcons>
            </Card>
          </motion.div>

          <motion.div variants={childVariants}>
            <Card
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <Avatar src="/ansh.jpg" alt="Ansh Nohria" />
              <Name>Ansh Nohria</Name>
              <Position>Smart Contract Developer</Position>
              <SocialIcons>
                <IconLink href="https://github.com/ansh" target="_blank">
                  <FaGithub />
                </IconLink>
                <IconLink href="https://linkedin.com/in/ansh" target="_blank">
                  <FaLinkedin />
                </IconLink>
                <IconLink href="https://twitter.com/ansh" target="_blank">
                  <FaTwitter />
                </IconLink>
              </SocialIcons>
            </Card>
          </motion.div>
        </TeamGrid>
      </motion.div>
    </TeamWrapper>
  );
};

export default MeetTheTeam;
