import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GearData, GearProjectData, initialGearProject, Position } from "../../../core/types";
import { RootState } from "../index";

const gearsAdapter = createEntityAdapter<GearData>();

export const initializeGearsState = (gearProject: GearProjectData) => {
  return gearsAdapter.getInitialState(gearProject.gears);
}

const gearsSlice = createSlice({
  name: 'gears',
  initialState: initializeGearsState(initialGearProject),
  reducers: {
    resetGears: gearsAdapter.setAll,
    addGear: gearsAdapter.addOne,
    addGears: gearsAdapter.addMany,
    updateGear: gearsAdapter.updateOne,
    removeGear: gearsAdapter.removeOne,
    updateGearPosition: (state, action: PayloadAction<{ id: string; position: Position }>) => {
      const { id, position } = action.payload;
      gearsAdapter.updateOne(state, { id, changes: { position } });
    },
    updateGearPositionAngle: (state, action: PayloadAction<{ id: string; positionAngle: number }>) => {
      const { id, positionAngle } = action.payload;
      gearsAdapter.updateOne(state, { id, changes: { positionAngle } });
    },
    updateGearColor: (state, action: PayloadAction<{ id: string; color: string }>) => {
      const { id, color } = action.payload;
      gearsAdapter.updateOne(state, { id, changes: { color } });
    },
    updateGearTeeth: (state, action: PayloadAction<{ id: string; teeth: number }>) => {
      const { id, teeth } = action.payload;
      gearsAdapter.updateOne(state, { id, changes: { teeth } });
    },
    updateGearSpeed: (state, action: PayloadAction<{ id: string; speed: number }>) => {
      const { id, speed } = action.payload;
      gearsAdapter.updateOne(state, { id, changes: { speed } });
    },
  },
});

const gearsSelectors = gearsAdapter.getSelectors<RootState>(state => state.gears);
export const selectAllGears = gearsSelectors.selectAll;

export const {
  resetGears,
  addGear,
  addGears,
  updateGear,
  removeGear,
  updateGearColor,
  updateGearTeeth,
  updateGearSpeed,
  updateGearPosition,
  updateGearPositionAngle,
} = gearsSlice.actions;

export default gearsSlice.reducer;
