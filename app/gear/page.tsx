"use client"
import dynamic from "next/dynamic";

const GearProject = dynamic(() => import("./GearProject").then(mod => mod.GearProject), { ssr: false });

function init() {
  const VConsole = import("vconsole");
  VConsole.then(mod => {
    new mod.default();
  });
}
init();

export default function Home() {
  return <GearProject />
}
