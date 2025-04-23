"use client"
import { GearProject } from "@/app/gear/GearProject";
import { mockGearProject, addGearToMockGearProject } from "./core/types.";
import { useEffect, useState } from "react";

const GearGroup: React.FC = () => {
  return (
    <GearProject gearProject={mockGearProject} addGear={addGearToMockGearProject} />
  )
}

export default function Home() {
  const [isInClient, setIsInClient] = useState(false);
  useEffect(() => {
    setIsInClient(true);
  }, []);
  return isInClient ? <GearGroup /> : <div>Loading...</div>;
}
