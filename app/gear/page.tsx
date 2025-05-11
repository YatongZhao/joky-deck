"use client"
import dynamic from "next/dynamic";

const GearProject = dynamic(() => import("./GearProject").then(mod => mod.GearProject), { ssr: false });

export default function Home() {
  return <GearProject />
}
