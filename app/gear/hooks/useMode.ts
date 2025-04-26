import { useHotkeys } from "react-hotkeys-hook";
import { useGearProjectStore } from "../store";
import { useEffect } from "react";

export enum Mode {
  Normal = 'normal',
  Add = 'add',
  Active = 'active',
}

export const useMode = (): Mode => {
  const activeGearId = useGearProjectStore((state) => state.activeGearId);
  const addModeEnabled = useGearProjectStore((state) => state.addModeEnabled);

  if (!activeGearId) return Mode.Normal;
  if (addModeEnabled) return Mode.Add;
  return Mode.Active;
}

export const useModeHotKeys = () => {
  const mode = useMode();
  const setAddModeEnabled = useGearProjectStore((state) => state.setAddModeEnabled);
  const setActiveGearId = useGearProjectStore((state) => state.setActiveGearId);
  const activeGearId = useGearProjectStore((state) => state.activeGearId);

  useHotkeys('a', () => {
    if (mode === Mode.Active) {
      setAddModeEnabled(true);
    }
  });
  useHotkeys('esc', () => {
    if (mode === Mode.Add) {
      setAddModeEnabled(false);
    } else if (mode === Mode.Active) {
      setActiveGearId(null);
    }
  });

  useEffect(() => {
    if (!activeGearId) {
      setAddModeEnabled(false);
    }
  }, [activeGearId, setAddModeEnabled]);
  
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (mode === Mode.Add) {
        event.preventDefault();
        setAddModeEnabled(false);
      }
    }
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [mode, setAddModeEnabled]);
}
