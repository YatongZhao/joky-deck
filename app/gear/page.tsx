"use client"
import { GearProject } from "@/app/gear/GearProject";
import { useEffect, useState } from "react";
import { EditorMachineContext } from "./editorMachine";

export default function Home() {
  const [isInClient, setIsInClient] = useState(false);
  useEffect(() => {
    setIsInClient(true);
  }, []);
  return isInClient
    ? (
      <EditorMachineContext.Provider>
        <GearProject />
      </EditorMachineContext.Provider>
    )
    : ( <div>Loading...</div> );
}
