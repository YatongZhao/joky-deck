import { useHotkeys } from "react-hotkeys-hook";
import { useEffect } from "react";
import { useGearProjectStore } from "../store";
import { useSelector } from "@xstate/react";

export const useModeHotKeys = () => {
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const state = useSelector(editorMachineActor, (state) => state);
  const { send } = editorMachineActor;

  useHotkeys('a', () => {
    send({ type: 'enterAddingMode' });
  });

  useHotkeys('esc', () => {
    if (state.hasTag('CanEscape')) {
      send({ type: 'esc' });
    }
  });

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (state.hasTag('CanEscape')) {
        event.preventDefault();
        send({ type: 'esc' });
      }
    }
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [send, state]);
}
