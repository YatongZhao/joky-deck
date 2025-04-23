"use client"
import { GearProject } from "@/app/gear/GearProject";
import { Box } from "@mantine/core";
import { mockGearProject } from "./core/types.";

const GearGroup: React.FC = () => {
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
      <GearProject gearProject={mockGearProject} />
    </Box>
  )
}

export default function Home() {
  return <GearGroup />;
}
