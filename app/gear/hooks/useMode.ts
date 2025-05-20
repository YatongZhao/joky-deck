import { useHotkeys } from "react-hotkeys-hook";
import { useEffect } from "react";
import { useAppSelector } from "../store/redux";
import { editorMachineSendSelector } from "../store/redux/slices/editorMachineSlice";

export const useModeHotKeys = () => {
  const editorMachineSend = useAppSelector(editorMachineSendSelector);

  useHotkeys('a', () => {
    editorMachineSend({ type: 'enterAddingMode' });
  });

  useHotkeys('esc', () => {
    editorMachineSend({ type: 'esc' });
  });

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (editorMachineSend({ type: 'esc' })) {
        event.preventDefault();
      }
    }
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [editorMachineSend]);
}
