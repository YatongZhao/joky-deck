import { gsap } from "gsap";
import { store } from "./redux";
import { selectAllGears } from "./redux/slices/gearsSlice";
import { vec2 } from "gl-matrix";
import { getGearAngle, getGearPosition } from "../GearParser";

export const dynamicGearPositionMap = new Map<string, vec2>();
export const dynamicGearAngleMap = new Map<string, number>();

gsap.ticker.add(() => {
    // TODO: Calculate the dynamic gear position
    const storeState = store.getState();
    const gearProjectModule = storeState.module.value;
    const gears = selectAllGears(storeState);
    const time = gsap.ticker.time;

    for (const gear of gears) {
        dynamicGearPositionMap.set(gear.id, getGearPosition(gear, gears, time, gearProjectModule));
        dynamicGearAngleMap.set(gear.id, getGearAngle(gear, gears, time).angle);
    }
})
