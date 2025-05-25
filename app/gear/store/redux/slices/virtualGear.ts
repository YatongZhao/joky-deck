import { __internal_virtual_gear_id__ } from "@/app/gear/constant";
import { GearData, GearType } from "@/app/gear/core/types";

const initialVirtualGearState: GearData = {
  id: __internal_virtual_gear_id__,
  type: GearType.Relative,
  parentId: null,
  positionAngle: 0,
  teeth: 3,
  speed: 0,
  position: [0, 0],
  color: '#4dabf7',
}

export const initializeVirtualGearState = (): GearData => {
  return {
    ...initialVirtualGearState,
  };
}
