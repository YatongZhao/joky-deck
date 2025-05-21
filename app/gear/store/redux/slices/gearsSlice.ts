import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GearData, GearProjectData, initialGearProject, Position } from "../../../core/types";
import { AppThunk, RootState } from "../index";
import { pushUndo } from "./undoManagerSlice";

const gearsAdapter = createEntityAdapter<GearData>();

export const initializeGearsState = (gearProject: GearProjectData) => {
  return gearsAdapter.getInitialState({}, gearProject.gears);
}

const gearsSlice = createSlice({
  name: 'gears',
  initialState: initializeGearsState(initialGearProject),
  reducers: {
    resetGears: (state, action: PayloadAction<GearData[]>) => {
      return gearsAdapter.getInitialState({}, action.payload);
    },
    addGear: gearsAdapter.addOne,
    addGears: gearsAdapter.addMany,
    _updateGear: gearsAdapter.updateOne,
    removeGear: gearsAdapter.removeOne,
  },
});

const gearsSelectors = gearsAdapter.getSelectors<RootState>(state => state.gears);
export const selectAllGears = gearsSelectors.selectAll;
export const selectGearById = gearsSelectors.selectById;

export const {
  resetGears,
  addGear,
  addGears,
  removeGear,
} = gearsSlice.actions;

const { _updateGear } = gearsSlice.actions;

export const updateGear = (id: string, changes: Partial<GearData>): AppThunk => (dispatch, getState) => {
  const gear = selectGearById(getState(), id);
  if (gear) {
    dispatch(_updateGear({ id, changes }));
    dispatch(pushUndo(`Change Gear ${id}`));
  }
}

export const updateGearPositionAngle = (id: string, positionAngle: number): AppThunk => (dispatch, getState) => {
  const gear = selectGearById(getState(), id);
  if (gear && gear.positionAngle !== positionAngle) {
    dispatch(_updateGear({ id, changes: { positionAngle } }));
    dispatch(pushUndo(`Change Gear Position Angle ${id}`));
  }
}

export const updateGearColor = (id: string, color: string): AppThunk => (dispatch, getState) => {
  const gear = selectGearById(getState(), id);
  if (gear && gear.color !== color) {
    dispatch(_updateGear({ id, changes: { color } }));
    dispatch(pushUndo(`Change Gear Color ${id}`));
  }
}

export const updateGearTeeth = (id: string, teeth: number): AppThunk => (dispatch, getState) => {
  const gear = selectGearById(getState(), id);
  if (gear && gear.teeth !== teeth) {
    dispatch(_updateGear({ id, changes: { teeth } }));
    dispatch(pushUndo(`Change Gear Teeth ${id}`));
  }
}

export const updateGearSpeed = (id: string, speed: number): AppThunk => (dispatch, getState) => {
  const gear = selectGearById(getState(), id);
  if (gear && gear.speed !== speed) {
    dispatch(_updateGear({ id, changes: { speed } }));
    dispatch(pushUndo(`Change Gear Speed ${id}`));
  }
}

export const updateGearPosition = (id: string, position: Position): AppThunk => (dispatch, getState) => {
  const gear = selectGearById(getState(), id);
  if (gear && gear.position !== position) {
    dispatch(_updateGear({ id, changes: { position } }));
    dispatch(pushUndo(`Change Gear Position ${id}`));
  }
}

export default gearsSlice.reducer;
