import { useHotkeys } from "react-hotkeys-hook";
import { useEffect } from "react";
import { useEditorMachineSend } from "../store";
import { useAppSelector } from "../store/redux";
import { editorMachineSendSelector } from "../store/redux/slices/editorMachineSlice";

export const useModeHotKeys = () => {
  const send = useEditorMachineSend();
  const editorMachineSend = useAppSelector(editorMachineSendSelector);

  useHotkeys('a', () => {
    send({ type: 'enterAddingMode' });
    editorMachineSend({ type: 'enterAddingMode' });
  });

  useHotkeys('esc', () => {
    send({ type: 'esc' });
    editorMachineSend({ type: 'esc' });
  });

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (send({ type: 'esc' })) {
        event.preventDefault();
      }
      if (editorMachineSend({ type: 'esc' })) {
        event.preventDefault();
      }
    }
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [send, editorMachineSend]);
}
