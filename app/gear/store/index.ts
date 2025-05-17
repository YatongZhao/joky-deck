import { create, StateCreator } from "zustand";
import { combine } from "zustand/middleware";
import { GearData, GearProjectData, initialGearProject } from "../core/types";
import { useCallback, useMemo } from "react";
import { BehaviorSubject, combineLatest, debounceTime, fromEvent, merge, of, skip } from "rxjs";
import { mat3, vec2 } from "gl-matrix";
import { createUndoRedoManager, pushUndoRedoNode, UndoRedoManager, undoUndoRedoNode, redoUndoRedoNode, getUndoRedoNode } from "./undoRedoManager";
import { editorMachine } from "../editorMachine";
import { Actor, createActor, Snapshot } from "xstate";
import { setGearProjectDataToLocalStorage } from "./localStorage";
import { useSelector } from "@xstate/react";

const { viewBox, ...initialGearProjectWithoutViewBox } = initialGearProject;

export const viewBoxA$ = new BehaviorSubject<vec2>(viewBox.a);
export const viewBoxB$ = new BehaviorSubject<vec2>(viewBox.b);
export const viewBoxC$ = new BehaviorSubject<vec2>(vec2.fromValues(viewBox.a[0], viewBox.b[1]));
export const viewBoxD$ = new BehaviorSubject<vec2>(vec2.fromValues(viewBox.b[0], viewBox.a[1]));

viewBoxA$.subscribe((value) => {
  if (viewBoxC$.getValue()[0] !== value[0]) {
    viewBoxC$.next(vec2.fromValues(value[0], viewBoxC$.getValue()[1]));
  }
  if (viewBoxD$.getValue()[1] !== value[1]) {
    viewBoxD$.next(vec2.fromValues(viewBoxD$.getValue()[0], value[1]));
  }
});
viewBoxB$.subscribe((value) => {
  if (viewBoxC$.getValue()[1] !== value[1]) {
    viewBoxC$.next(vec2.fromValues(viewBoxC$.getValue()[0], value[1]));
  }
  if (viewBoxD$.getValue()[0] !== value[0]) {
    viewBoxD$.next(vec2.fromValues(value[0], viewBoxD$.getValue()[1]));
  }
});

viewBoxC$.subscribe((value) => {
  if (viewBoxA$.getValue()[0] !== value[0]) {
    viewBoxA$.next(vec2.fromValues(value[0], viewBoxA$.getValue()[1]));
  }
  if (viewBoxB$.getValue()[1] !== value[1]) {
    viewBoxB$.next(vec2.fromValues(viewBoxB$.getValue()[0], value[1]));
  }
});
viewBoxD$.subscribe((value) => {
  if (viewBoxA$.getValue()[1] !== value[1]) {
    viewBoxA$.next(vec2.fromValues(viewBoxA$.getValue()[0], value[1]));
  }
  if (viewBoxB$.getValue()[0] !== value[0]) {
    viewBoxB$.next(vec2.fromValues(value[0], viewBoxB$.getValue()[1]));
  }
});

export const svgMatrix$ = new BehaviorSubject<mat3>(initialGearProject.displayMatrix);

export const translateMatrix$ = new BehaviorSubject<mat3>(mat3.create());
merge(of(null), fromEvent(window, 'resize')).subscribe(() => {
  const windowInnerWidth = window.innerWidth;
  const windowInnerHeight = window.innerHeight;
  const translateVector = vec2.fromValues(windowInnerWidth / 2, windowInnerHeight / 2);
  const translateMatrix = mat3.create();
  mat3.translate(translateMatrix, translateMatrix, translateVector);
  translateMatrix$.next(translateMatrix);
});

export const finalMatrix$ = new BehaviorSubject<mat3>(mat3.create());
combineLatest([svgMatrix$, translateMatrix$]).subscribe(([svgMatrix, translateMatrix]) => {
  const finalMatrix = mat3.create();
  mat3.multiply(finalMatrix, translateMatrix, svgMatrix);
  finalMatrix$.next(finalMatrix);
});

const calculateViewBox = (finalMatrix: mat3) => {
  const windowInnerWidth = window.innerWidth;
  const windowInnerHeight = window.innerHeight;
  const inverseFinalMatrix = mat3.create();
  mat3.invert(inverseFinalMatrix, finalMatrix);
  const leftTopPoint = vec2.transformMat3(vec2.create(), vec2.fromValues(0, 0), inverseFinalMatrix);
  const rightBottomPoint = vec2.transformMat3(vec2.create(), vec2.fromValues(windowInnerWidth, windowInnerHeight), inverseFinalMatrix);
  return {
    x: leftTopPoint[0],
    y: leftTopPoint[1],
    width: rightBottomPoint[0] - leftTopPoint[0],
    height: rightBottomPoint[1] - leftTopPoint[1],
  }
}
export type ViewBox = {
  x: number,
  y: number,
  width: number,
  height: number,
}
export const globalViewBox$ = new BehaviorSubject<ViewBox>(calculateViewBox(finalMatrix$.getValue()));
finalMatrix$.subscribe((finalMatrix) => {
  globalViewBox$.next(calculateViewBox(finalMatrix));
});

function createEditorMachineActor(editorMachineSnapshot?: Snapshot<typeof editorMachine> | null) {
  const editorMachineActor = createActor(editorMachine, { snapshot: editorMachineSnapshot ?? undefined }).start();
  editorMachineActor.subscribe(trySaveGearProjectToLocalStorage);
  editorMachineActor.subscribe(() => useGearProjectStore.getState().pushUndo('editor state changed'));
  return editorMachineActor;
}

const initEditorMachineActor = createEditorMachineActor();

const initialEditorMachineSnapshot = initEditorMachineActor.getPersistedSnapshot() as Snapshot<typeof editorMachine>;

// UndoRedoState is the state of the undo/redo manager
// It is the state of the gear project without the display matrix
// because the display matrix is not part of the undo/redo history
type UndoRedoState = { gearProject: Omit<GearProjectData, 'displayMatrix'>; description: string };

type GearProjectStoreState = {
  gearProject: Omit<GearProjectData, 'viewBox' | 'displayMatrix' | 'editorMachineState'>;
  undoRedoManager: UndoRedoManager<UndoRedoState>;
  editorMachineActor: Actor<typeof editorMachine>;
}

type GearProjectStoreActions = {
  addGear: (gear: GearData) => void;
  setGearProject: (gearProject: GearProjectData) => void;
  setRootGearPosition: (rootGearPosition: vec2) => void;
  setGear: (gearId: string, partialGear: Partial<GearData>) => void;
  setGearPositionAngle: (gearId: string, positionAngle: number) => void;
  setGearColor: (gearId: string, color: string) => boolean; // return true if the color is changed
  setGearTeeth: (gearId: string, teeth: number) => boolean; // return true if the teeth is changed
  setGearSpeed: (gearId: string, speed: number) => boolean; // return true if the speed is changed
  pushUndo: (description: string) => void;
  undo: () => void;
  redo: () => void;
  // Anytime we start a new project, we need to reset the undo/redo manager
  resetUndoRedoManager: () => void;
  setEditorMachineActor: (editorMachineSnapshot: Snapshot<typeof editorMachine>) => void;
}

type AdditionalGearProjectStateCreator = StateCreator<GearProjectStoreState, [], [], GearProjectStoreActions>;
type SetGearProjectStore = Parameters<AdditionalGearProjectStateCreator>[0];
type GetGearProjectStore = Parameters<AdditionalGearProjectStateCreator>[1];

const setEditorMachineActor = (editorMachineSnapshot: Snapshot<typeof editorMachine> | null, set: SetGearProjectStore) => {
  set((state) => {
    state.editorMachineActor.stop();
    const editorMachineActor = createEditorMachineActor(editorMachineSnapshot);
    return {
      editorMachineActor,
    }
  });
}

const resetUndoRedoManager = (set: SetGearProjectStore) => {
  set(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { displayMatrix, ...gearProjectWithoutDisplayMatrix } = getGearProjectSnapshot();
    return {
      undoRedoManager: createUndoRedoManager({
        description: "",
        gearProject: gearProjectWithoutDisplayMatrix,
      }),
    }
  });
}
const setGearProjectWithoutDisplayMatrix = (gearProject: Omit<GearProjectData, 'displayMatrix'>, set: SetGearProjectStore) => {
  const { viewBox, editorMachineState, ...gearProjectWithoutViewBox } = gearProject;
  set({ gearProject: gearProjectWithoutViewBox });
  viewBoxA$.next(vec2.clone(viewBox.a));
  viewBoxB$.next(vec2.clone(viewBox.b));
  setEditorMachineActor(editorMachineState, set);
}

const setGearProject = (gearProject: GearProjectData, set: SetGearProjectStore) => {
  const { displayMatrix, ...gearProjectWithoutDisplayMatrix } = gearProject;
  setGearProjectWithoutDisplayMatrix(gearProjectWithoutDisplayMatrix, set);
  svgMatrix$.next(mat3.clone(displayMatrix));
  resetUndoRedoManager(set);
}

const setUndoRedoToSnapshot = (
  undoRedoManager: UndoRedoManager<UndoRedoState>,
  set: SetGearProjectStore,
  get: GetGearProjectStore
) => {
  if (undoRedoManager === get().undoRedoManager) return;
  const { gearProject } = getUndoRedoNode(undoRedoManager);
  setGearProjectWithoutDisplayMatrix(gearProject, set);
  set({ undoRedoManager });
}

export const useGearProjectStore = create(
  combine<GearProjectStoreState, GearProjectStoreActions>(
    {
      gearProject: initialGearProjectWithoutViewBox,
      undoRedoManager: createUndoRedoManager({
        description: "",
        gearProject: {
          ...initialGearProject,
          viewBox: { a: vec2.clone(initialGearProject.viewBox.a), b: vec2.clone(initialGearProject.viewBox.b) },
          displayMatrix: mat3.clone(initialGearProject.displayMatrix),
        },
        editorMachine: initialEditorMachineSnapshot,
      }),
      editorMachineActor: initEditorMachineActor,
    }, (set, get) => ({
    setGearProject: (gearProject: GearProjectData) => setGearProject(gearProject, set),
    addGear: (gearData: GearData) => {
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: [...state.gearProject.gears, gearData],
        },
      }));
    },
    setRootGearPosition: (rootGearPosition: vec2) => {
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          rootGearPosition,
        },
      }));
    },
    setGear: (gearId: string, partialGear: Partial<GearData>) => {
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: state.gearProject.gears.map((gear) => gear.id === gearId ? { ...gear, ...partialGear } : gear),
        },
      }));
    },
    setGearPositionAngle: (gearId: string, positionAngle: number) => {
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: state.gearProject.gears.map((gear) => gear.id === gearId ? { ...gear, positionAngle } : gear),
        },
      }));
    },
    setGearColor: (gearId: string, color: string) => {
      if (get().gearProject.gears.find((gear) => gear.id === gearId)?.color === color) return false;
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: state.gearProject.gears.map((gear) => gear.id === gearId ? { ...gear, color } : gear),
        },
      }));
      return true;
    },
    setGearTeeth: (gearId: string, teeth: number) => {
      if (get().gearProject.gears.find((gear) => gear.id === gearId)?.teeth === teeth) return false;
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: state.gearProject.gears.map((gear) => gear.id === gearId ? { ...gear, teeth } : gear),
        },
      }));
      return true;
    },
    setGearSpeed: (gearId: string, speed: number) => {
      if (get().gearProject.gears.find((gear) => gear.id === gearId)?.speed === speed) return false;
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: state.gearProject.gears.map((gear) => gear.id === gearId ? { ...gear, speed } : gear),
        },
      }));
      return true;
    },
    pushUndo: (description: string) => {
      set((state) => ({
        undoRedoManager: pushUndoRedoNode(state.undoRedoManager, {
          gearProject: getGearProjectSnapshot(),
          description,
        }),
      }));
    },
    undo: () => {
      setUndoRedoToSnapshot(undoUndoRedoNode(get().undoRedoManager), set, get);
    },
    redo: () => {
      setUndoRedoToSnapshot(redoUndoRedoNode(get().undoRedoManager), set, get);
    },
    resetUndoRedoManager: () => resetUndoRedoManager(set),
    setEditorMachineActor: (editorMachineSnapshot: Snapshot<typeof editorMachine>) => setEditorMachineActor(editorMachineSnapshot, set),
  }))
);

const getGear = (gears: GearData[], gearId?: string | null) => gearId ? gears.find((gear) => gear.id === gearId) : null;

export const useGear = (gearId?: string | null) => {
  const gears = useGearProjectStore((state) => state.gearProject.gears);
  return useMemo(() => getGear(gears, gearId), [gears, gearId]);
}

export const useGearChildren = (gearId: string) => {
  const gearProject = useGearProjectStore((state) => state.gearProject);
  return useMemo(() => gearProject.gears.filter((gear) => gear.parentId === gearId), [gearProject.gears, gearId]);
}

export const useEditorMachineSend = () => {
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const send = editorMachineActor.send;
  const state = useSelector(editorMachineActor, (state) => state);
  type Event = Parameters<typeof editorMachineActor.send>[0];
  /**
   * This function is used to send events to the editor machine.
   * @returns true if the event is sent, false if the event is not sent because the state does not allow it.
   */
  const safeSend = useCallback((event: Event) => {
    if (state.can(event)) {
      send(event);
      return true;
    }
    return false;
  }, [send, state]);
  return safeSend;
}

export function getGearProjectSnapshot(): GearProjectData {
  const state =useGearProjectStore.getState();
  return {
    ...state.gearProject,
    viewBox: { a: vec2.clone(viewBoxA$.getValue()), b: vec2.clone(viewBoxB$.getValue()) },
    displayMatrix: mat3.clone(svgMatrix$.getValue()),
    editorMachineState: state.editorMachineActor.getPersistedSnapshot() as Snapshot<typeof editorMachine>,
  };
}

const saveGearProjectToLocalStorage$ = new BehaviorSubject<GearProjectData | null>(null);
saveGearProjectToLocalStorage$.pipe(debounceTime(500)).subscribe((gearProject) => {
  if (gearProject) {
    setGearProjectDataToLocalStorage(gearProject);
  }
});

export function trySaveGearProjectToLocalStorage() {
  const gearProject = getGearProjectSnapshot();
  saveGearProjectToLocalStorage$.next(gearProject);
}

viewBoxA$.pipe(skip(1)).subscribe(trySaveGearProjectToLocalStorage);
viewBoxB$.pipe(skip(1)).subscribe(trySaveGearProjectToLocalStorage);
svgMatrix$.pipe(skip(1)).subscribe(trySaveGearProjectToLocalStorage);
useGearProjectStore.subscribe(trySaveGearProjectToLocalStorage);
