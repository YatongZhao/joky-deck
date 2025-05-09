import { useHotkeys } from "react-hotkeys-hook";
import { useEffect } from "react";
import { useGearProjectStore, useEditorMachineSend } from "../store";
import { useSelector } from "@xstate/react";

export const useModeHotKeys = () => {
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const state = useSelector(editorMachineActor, (state) => state);
  const send = useEditorMachineSend();

  useHotkeys('a', () => {
    send({ type: 'enterAddingMode' });
  });

  useHotkeys('esc', () => {
    send({ type: 'esc' });
  });

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (send({ type: 'esc' })) {
        event.preventDefault();
      }
    }
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [send, state]);
}
