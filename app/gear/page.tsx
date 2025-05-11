"use client"
import dynamic from "next/dynamic";
import { useEffect } from "react";
import VConsole from "vconsole";

const GearProject = dynamic(() => import("./GearProject").then(mod => mod.GearProject), { ssr: false });

export default function Home() {
  useEffect(() => {
    // if (process.env.NODE_ENV === 'development') {
      const vConsole = new VConsole();
      return () => {
        vConsole.destroy();
      }
    // }
  }, []);
  return <GearProject />
}
