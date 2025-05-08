import { create, StateCreator } from "zustand";
import { combine } from "zustand/middleware";
import { GearData, GearProjectData, mockGearProject } from "../core/types";
import { useMemo } from "react";
import { BehaviorSubject, combineLatest, debounceTime, fromEvent, merge, of, skip } from "rxjs";
import { mat3, vec2 } from "gl-matrix";
import { getGearTransformVector } from "../core/gear";
import { createUndoRedoManager, pushUndoRedoNode, UndoRedoManager, undoUndoRedoNode, redoUndoRedoNode, getUndoRedoNode } from "./undoRedoManager";
import { editorMachine } from "../editorMachine";
import { Actor, createActor, Snapshot } from "xstate";
import { setGearProjectDataToLocalStorage } from "./localStorage";
const { viewBox, ...mockGearProjectWithoutViewBox } = mockGearProject;

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

export const svgMatrix$ = new BehaviorSubject<mat3>(mockGearProject.displayMatrix);

export const translateMatrix$ = new BehaviorSubject<mat3>(mat3.create());
export const useInitialTranslateMatrix$ = () => {
  const subscription = merge(of(null), fromEvent(window, 'resize')).subscribe(() => {
    const windowInnerWidth = window.innerWidth;
    const windowInnerHeight = window.innerHeight;
    const translateVector = vec2.fromValues(windowInnerWidth / 2, windowInnerHeight / 2);
    const translateMatrix = mat3.create();
    mat3.translate(translateMatrix, translateMatrix, translateVector);
    translateMatrix$.next(translateMatrix);
  });
  return () => subscription.unsubscribe();
}

export const finalMatrix$ = new BehaviorSubject<mat3>(mat3.create());
combineLatest([svgMatrix$, translateMatrix$]).subscribe(([svgMatrix, translateMatrix]) => {
  const finalMatrix = mat3.create();
  mat3.multiply(finalMatrix, translateMatrix, svgMatrix);
  finalMatrix$.next(finalMatrix);
});

const editorMachineActor = createActor(editorMachine).start();
const initialEditorMachineSnapshot = editorMachineActor.getPersistedSnapshot() as Snapshot<typeof editorMachine>;

type UndoRedoState = { gearProject: GearProjectData; description: string };

type GearProjectStoreState = {
  gearProject: Omit<GearProjectData, 'viewBox' | 'displayMatrix' | 'editorMachineState'>;
  undoRedoManager: UndoRedoManager<UndoRedoState>;
  editorMachineActor: Actor<typeof editorMachine>;
}

type GearProjectStoreActions = {
  addGear: (gear: GearData) => void;
  setGearProject: (gearProject: GearProjectData) => void;
  setGearPositionAngle: (gearId: string, positionAngle: number) => void;
  setGearColor: (gearId: string, color: string) => boolean; // return true if the color is changed
  pushUndo: (description: string) => void;
  undo: () => void;
  redo: () => void;
  setEditorMachineActor: (editorMachineSnapshot: Snapshot<typeof editorMachine>) => void;
}

type AdditionalGearProjectStateCreator = StateCreator<GearProjectStoreState, [], [], GearProjectStoreActions>;
type SetGearProjectStore = Parameters<AdditionalGearProjectStateCreator>[0];
type GetGearProjectStore = Parameters<AdditionalGearProjectStateCreator>[1];

const setEditorMachineActor = (editorMachineSnapshot: Snapshot<typeof editorMachine> | null, set: SetGearProjectStore) => {
  set((state) => {
    state.editorMachineActor.stop();
    const editorMachineActor = createActor(editorMachine, { snapshot: editorMachineSnapshot ?? undefined }).start();
    editorMachineActor.subscribe(trySaveGearProjectToLocalStorage);
    return {
      editorMachineActor,
    }
  });
}

const setGearProject = (gearProject: GearProjectData, set: SetGearProjectStore) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { viewBox, displayMatrix, editorMachineState, ...gearProjectWithoutViewBox } = gearProject;
  set({ gearProject: gearProjectWithoutViewBox });
  viewBoxA$.next(vec2.clone(viewBox.a));
  viewBoxB$.next(vec2.clone(viewBox.b));
  svgMatrix$.next(mat3.clone(displayMatrix));
  setEditorMachineActor(editorMachineState, set);
}


const setUndoRedoManager = (
  undoRedoManager: UndoRedoManager<UndoRedoState>,
  set: SetGearProjectStore,
  get: GetGearProjectStore
) => {
  if (undoRedoManager === get().undoRedoManager) return;
  const { gearProject } = getUndoRedoNode(undoRedoManager);
  setGearProject(gearProject, set);
  set({ undoRedoManager });
}

export const useGearProjectStore = create(
  combine<GearProjectStoreState, GearProjectStoreActions>(
    {
      gearProject: mockGearProjectWithoutViewBox,
      undoRedoManager: createUndoRedoManager({
        description: "",
        gearProject: {
          ...mockGearProject,
          viewBox: { a: vec2.clone(mockGearProject.viewBox.a), b: vec2.clone(mockGearProject.viewBox.b) },
          displayMatrix: mat3.clone(mockGearProject.displayMatrix),
        },
        editorMachine: initialEditorMachineSnapshot,
      }),
      editorMachineActor,
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
    pushUndo: (description: string) => {
      set((state) => ({
        undoRedoManager: pushUndoRedoNode(state.undoRedoManager, {
          gearProject: getGearProjectSnapshot(),
          description,
        }),
      }));
    },
    undo: () => {
      setUndoRedoManager(undoUndoRedoNode(get().undoRedoManager), set, get);
    },
    redo: () => {
      setUndoRedoManager(redoUndoRedoNode(get().undoRedoManager), set, get);
    },
    setEditorMachineActor: (editorMachineSnapshot: Snapshot<typeof editorMachine>) => setEditorMachineActor(editorMachineSnapshot, set),
  }))
);

const getGear = (gears: GearData[], gearId: string | null) => gears.find((gear) => gear.id === gearId);

export const useGear = (gearId: string | null) => {
  const gears = useGearProjectStore((state) => state.gearProject.gears);
  return useMemo(() => getGear(gears, gearId), [gears, gearId]);
}

export const useGearChildren = (gearId: string) => {
  const gearProject = useGearProjectStore((state) => state.gearProject);
  return useMemo(() => gearProject.gears.filter((gear) => gear.parentId === gearId), [gearProject.gears, gearId]);
}

export const useGearPosition = (gearId: string | null) => {
  const gears = useGearProjectStore((state) => state.gearProject.gears);
  const gearModule = useGearProjectStore((state) => state.gearProject.module);
  const targetGear = useGear(gearId);

  const gearPosition = useMemo(() => {
    let currentGear = targetGear;
    const globalTransformMatrix = mat3.create();
  
    if (!currentGear) return vec2.create();
  
    let parentGear;
    while (currentGear.parentId !== null) {
      parentGear = getGear(gears, currentGear.parentId)!;
      mat3.translate(globalTransformMatrix, globalTransformMatrix, getGearTransformVector(currentGear.positionAngle, currentGear.teeth, parentGear.teeth, gearModule))
      currentGear = parentGear;
    }
  
    return vec2.transformMat3(vec2.create(), vec2.create(), globalTransformMatrix);
  }, [gears, gearModule, targetGear])

  return gearPosition;
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
editorMachineActor.subscribe(trySaveGearProjectToLocalStorage);
useGearProjectStore.subscribe(trySaveGearProjectToLocalStorage);
