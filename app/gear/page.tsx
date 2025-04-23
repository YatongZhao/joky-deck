"use client"
import { GearProject } from "@/app/gear/GearProject";
import { mockGearProject } from "./core/types.";

const GearGroup: React.FC = () => {
  return (
    <GearProject gearProject={mockGearProject} />
  )
}

export default function Home() {
  return <GearGroup />;
}
