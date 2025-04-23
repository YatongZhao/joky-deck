"use client"
import { GearProject } from "@/app/gear/GearProject";
import { Box } from "@mantine/core";
import { useEffect, useState } from "react";
import { mockGearProject } from "./core/types.";

const GearGroup: React.FC = () => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initial update
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Don't render until we have valid dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  return (
    <Box 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <GearProject
        width={dimensions.width}
        height={dimensions.height}
        gearProject={mockGearProject}
      />
    </Box>
  )
}

export default function Home() {
  return <GearGroup />;
}
