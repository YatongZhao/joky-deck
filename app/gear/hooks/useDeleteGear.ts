import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppDispatch, useAppSelector } from '../store/redux';
import { editorMachineSelector, editorMachineSendSelector } from '../store/redux/slices/editorMachineSlice';
import { useSelector } from '@xstate/react';
import { removeGears, findAllDescendantGearIds, selectAllGears } from '../store/redux/slices/gearsSlice';

export const useDeleteGear = () => {
  const dispatch = useAppDispatch();
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const allGears = useAppSelector(selectAllGears);

  const handleDelete = useCallback(() => {
    if (!activeGearId) return;

    // Find all descendant gears
    const descendantIds = findAllDescendantGearIds(activeGearId, allGears);
    
    // Combine active gear ID with descendant IDs
    const gearsToRemove = [activeGearId, ...descendantIds];
    
    // Remove all gears
    dispatch(removeGears(gearsToRemove));
    
    // Clear active gear selection
    editorMachineSend({ type: 'unselectGear' });
  }, [activeGearId, allGears, dispatch, editorMachineSend]);

  // Register keyboard shortcuts
  useHotkeys('d, delete, backspace', (e) => {
    e.preventDefault();
    handleDelete();
  }, {
    enabled: !!activeGearId,
    preventDefault: true,
  }, [handleDelete]);

  return handleDelete;
}; 