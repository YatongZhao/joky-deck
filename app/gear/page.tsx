"use client"
import { GearProject } from "@/app/gear/GearProject";
import { useEffect, useState } from "react";

export default function Home() {
  const [isInClient, setIsInClient] = useState(false);
  useEffect(() => {
    setIsInClient(true);
  }, []);
  return isInClient
    ? (
      <GearProject />
    )
    : ( <div>Loading...</div> );
}
