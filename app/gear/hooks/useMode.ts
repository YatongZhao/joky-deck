import { useHotkeys } from "react-hotkeys-hook";
import { useEffect } from "react";
import { EditorMachineContext } from "../editorMachine";

export const useModeHotKeys = () => {
  const state = EditorMachineContext.useSelector((state) => state);
  const { send } = EditorMachineContext.useActorRef();

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
