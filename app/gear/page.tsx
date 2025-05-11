"use client"
import dynamic from "next/dynamic";
import VConsole from "vconsole";

const GearProject = dynamic(() => import("./GearProject").then(mod => mod.GearProject), { ssr: false });

new VConsole();

export default function Home() {
  return <GearProject />
}
