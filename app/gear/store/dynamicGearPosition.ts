import { gsap } from "gsap";
import { store } from "./redux";
import { selectAllGears } from "./redux/slices/gearsSlice";
import { vec2 } from "gl-matrix";
import { getGearAngle, getGearPosition } from "../GearParser";

export const dynamicGearPositionMap = new Map<string, vec2>();
export const dynamicGearAngleMap = new Map<string, number>();

const tl = {
  time: 0,
  speed: 1,
}

export const addTicker = (callback: (time: number, deltaTime: number) => void) => {
  const tickerCallback = (time: number, deltaTime: number) => {
    tl.time += deltaTime * tl.speed / 1000;
    callback(tl.time, deltaTime);
  }
  gsap.ticker.add(tickerCallback);
  return () => gsap.ticker.remove(tickerCallback);
}

// TODO: Optimize this
addTicker((tlTime) => {
  const storeState = store.getState();
  const gearProjectModule = storeState.module.value;
  const gears = selectAllGears(storeState);

  for (const gear of gears) {
    dynamicGearPositionMap.set(gear.id, getGearPosition(gear, gears, tlTime, gearProjectModule));
    dynamicGearAngleMap.set(gear.id, getGearAngle(gear, gears, tlTime).angle);
  }
})

// gsap.globalTimeline.pause();
window.gsap = gsap;
(window as any).tl = tl;
