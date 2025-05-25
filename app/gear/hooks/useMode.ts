import { useHotkeys } from "react-hotkeys-hook";
import { useEffect } from "react";
import { useAppSelector } from "../store/redux";
import { canAddGearSelector, canEscSelector, editorMachineSendSelector } from "../store/redux/slices/editorMachineSlice";

export const useModeHotKeys = () => {
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const canAddGear = useAppSelector(canAddGearSelector);
  const canEsc = useAppSelector(canEscSelector);

  useHotkeys('a', () => {
    editorMachineSend({ type: 'enterAddingMode' });
  }, { enabled: canAddGear });

  useHotkeys('esc', () => {
    editorMachineSend({ type: 'esc' });
  }, { enabled: canEsc });

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
