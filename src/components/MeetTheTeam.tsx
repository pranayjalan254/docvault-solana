import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const Section = styled.section`
  padding: 100px 0;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 48px;
  margin-bottom: 50px;
`;

const TeamContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const TeamMember = styled(motion.div)`
  width: 200px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0px 10px 15px rgba(144, 202, 249, 0.5);
  }
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  background-color: #0b0c1b;
  border-radius: 50%;
  margin-bottom: 10px;
  transition: background-color 0.3s ease;

  ${TeamMember}:hover & {
    background-color: #90caf9;
  }
`;

export const MeetTheTeam: React.FC = () => {
  return (
    <Section>
      <Title>Meet the Team</Title>
      <TeamContainer>
        <TeamMember whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
          <Avatar />
          <h3>Pranay Jalan</h3>
          <p>Founder & Developer</p>
        </TeamMember>
        <TeamMember whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
          <Avatar />
          <h3>John Doe</h3>
          <p>Blockchain Expert</p>
        </TeamMember>
        <TeamMember whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
          <Avatar />
          <h3>Jane Smith</h3>
          <p>UI/UX Designer</p>
        </TeamMember>
      </TeamContainer>
    </Section>
  );
};
