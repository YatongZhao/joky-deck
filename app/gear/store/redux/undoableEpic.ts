import { Epic, ofType } from "redux-observable";
import { persistViewBox } from "./slices/viewBoxSlice";
import { debounceTime, map, Observable } from "rxjs";
import { pushUndo } from "./slices/undoManagerSlice";
import { setModule } from "./slices/moduleSlice";
import { addGear, persistGear, removeGears } from "./slices/gearsSlice";
import { persistEditorMachineSnapshot } from "./slices/editorMachineSlice";

export const undoableActionTypes = [
  persistViewBox.type,
  setModule.type,
  addGear.type,
  persistGear.type,
  removeGears.type,
  persistEditorMachineSnapshot.type,
] as const;

export const undoableEpic: Epic<any, any, any, any> = (action$: Observable<any>) => action$.pipe(
  ofType(...undoableActionTypes),
  debounceTime(10),
  map((action) => pushUndo(action.type))
);
