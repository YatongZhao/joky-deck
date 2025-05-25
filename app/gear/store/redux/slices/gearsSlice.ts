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
    removeGears: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(id => {
        gearsAdapter.removeOne(state, id);
      });
    },
  },
});

const gearsSelectors = gearsAdapter.getSelectors<RootState>(state => state.gears);
export const selectAllGears = gearsSelectors.selectAll;
export const selectAllUserGears = createSelector(
  selectAllGears,
  (gears) => gears.filter((gear) => gear.id !== __internal_virtual_gear_id__),
);
export const selectGearById = gearsSelectors.selectById;

// Helper function to find all descendant gear IDs
export const findAllDescendantGearIds = (gearId: string, gears: GearData[]): string[] => {
  const descendants: string[] = [];
  
  const findDescendants = (currentId: string) => {
    // Find all direct children
    const children = gears.filter(gear => gear.parentId === currentId);
    
    // Add each child and recursively find their descendants
    children.forEach(child => {
      descendants.push(child.id);
      findDescendants(child.id);
    });
  };

  findDescendants(gearId);
  return descendants;
};

export const {
  resetGears,
  addGear,
  addGears,
  removeGear,
  removeGears,
  updateGear,
  persistGear,
} = gearsSlice.actions;

export default gearsSlice.reducer;
