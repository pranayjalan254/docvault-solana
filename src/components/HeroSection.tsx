import React, { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import styled from "styled-components";

const HeroContainer = styled.section`
  height: 100vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 80px; /* Left and right padding for better alignment */
  background-color: #0e122a; /* Optional background */
`;

const Content = styled.div`
  max-width: 600px;
`;

const Title = styled(motion.h1)`
  font-size: 64px;
  margin-bottom: 20px;
  color: white;
`;

const Description = styled(motion.p)`
  font-size: 20px;
  margin-bottom: 40px;
  color: white;
`;

const Button = styled(motion.button)`
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  border: none;
  background-color: #90caf9;
  color: white;
  border-radius: 5px;
  transition: background 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #1e90ff;
    transform: scale(1.1);
  }
`;

// VaultModel component with scroll-based opening animation
function VaultModel() {
  const { scene, animations } = useGLTF("/vault.glb"); // Load vault model
  const group = useRef<any>(); // Reference for the 3D vault
  const mixer = useRef<THREE.AnimationMixer | null>(null); // Animation mixer for animations
  const { scrollYProgress } = useScroll(); // Use framer-motion's scroll hook

  // Adjust rotation to face front and scale the vault
  const rotation = useTransform(scrollYProgress, [0, 0.5], [0, Math.PI / 2]); // Vault rotation
  const positionY = useTransform(scrollYProgress, [0, 0.5], [0, -2]); // Vault moving down on open

  // Initialize animation mixer for controlling vault animations
  if (!mixer.current && animations && animations.length > 0) {
    mixer.current = new THREE.AnimationMixer(scene);
    animations.forEach((clip) => mixer.current?.clipAction(clip).play());
  }

  useFrame((_state, delta) => {
    if (mixer.current) mixer.current.update(delta); // Update animations
  });

  return (
    <motion.group
      ref={group}
      style={{ rotateY: rotation, y: positionY }} // Applying scroll-based animations
      rotation={[0, 0, 0]} // Set the initial rotation to face front
    >
      <primitive object={scene} scale={2} /> {/* Adjusted scale */}
    </motion.group>
  );
}

export const HeroSection: React.FC = () => {
  const handleScrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight, // Scroll to the next section
      behavior: "smooth",
    });
  };

  return (
    <>
      <HeroContainer>
        <Content>
          <Title
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Secure Your Documents
          </Title>
          <Description
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            With DocVault, your credentials are safe, secure, and easy to access
            anywhere, anytime.
          </Description>
          <Button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleScrollToNextSection}
          >
            Get Started
          </Button>
        </Content>
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, 5]} intensity={1} />
          <VaultModel /> {/* Vault 3D model with scroll-triggered animation */}
          <OrbitControls enableZoom={false} />
        </Canvas>
      </HeroContainer>
    </>
  );
};
