import { createEntityAdapter, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GearData, GearProjectData, initialGearProject } from "../../../core/types";
import { RootState } from "../index";
import { initializeVirtualGearState } from "./virtualGear";
import { __internal_virtual_gear_id__ } from "@/app/gear/constant";

const gearsAdapter = createEntityAdapter<GearData>();

export const initializeGearsState = (gearProject: GearProjectData) => {
  return gearsAdapter.getInitialState({}, gearProject.gears.concat(initializeVirtualGearState()));
}

const gearsSlice = createSlice({
  name: 'gears',
  initialState: initializeGearsState(initialGearProject),
  reducers: {
    resetGears: (state, action: PayloadAction<GearData[]>) => {
      return gearsAdapter.getInitialState({}, action.payload.concat(initializeVirtualGearState()));
    },
    addGear: gearsAdapter.addOne,
    addGears: gearsAdapter.addMany,
    updateGear: gearsAdapter.updateOne,
    persistGear: gearsAdapter.updateOne,
    removeGear: gearsAdapter.removeOne,
  },
});

const gearsSelectors = gearsAdapter.getSelectors<RootState>(state => state.gears);
export const selectAllGears = gearsSelectors.selectAll;
export const selectAllUserGears = createSelector(
  selectAllGears,
  (gears) => gears.filter((gear) => gear.id !== __internal_virtual_gear_id__),
);
export const selectGearById = gearsSelectors.selectById;

export const {
  resetGears,
  addGear,
  addGears,
  removeGear,
  updateGear,
  persistGear,
} = gearsSlice.actions;

export default gearsSlice.reducer;
