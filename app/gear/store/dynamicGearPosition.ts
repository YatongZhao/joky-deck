import { gsap } from "gsap";
import { store } from "./redux";
import { selectAllGears } from "./redux/slices/gearsSlice";
import { vec2 } from "gl-matrix";
import { getGearAngle, getGearPosition } from "../GearParser";
import React from "react";

export const dynamicGearPositionMap = new Map<string, vec2>();
export const dynamicGearAngleMap = new Map<string, number>();

interface TimelineState {
  time: number;
  speed: number;
}

const TIMELINE_SYMBOL = Symbol('timeline');

type TimelineSubscriber = () => void;

class TimelineManager {
  private [TIMELINE_SYMBOL]: TimelineState = {
    time: 0,
    speed: 1,
  };
  private subscribers = new Set<TimelineSubscriber>();

  private notifySubscribers() {
    this.subscribers.forEach(subscriber => subscriber());
  }

  subscribe(subscriber: TimelineSubscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  getTime(): number {
    return this[TIMELINE_SYMBOL].time;
  }

  getSpeed(): number {
    return this[TIMELINE_SYMBOL].speed;
  }

  setSpeed(speed: number | ((speed: number) => number)): void {
    if (typeof speed === "function") {
      this[TIMELINE_SYMBOL].speed = speed(this[TIMELINE_SYMBOL].speed);
    } else {
      this[TIMELINE_SYMBOL].speed = speed;
    }
    this.notifySubscribers();
  }

  updateTime(deltaTime: number): void {
    this[TIMELINE_SYMBOL].time += deltaTime * this[TIMELINE_SYMBOL].speed / 1000;
    this.notifySubscribers();
  }
}

export const timelineManager = new TimelineManager();

// React hook for subscribing to timeline state
export function useTimeline() {
  const subscribe = React.useCallback((callback: () => void) => {
    return timelineManager.subscribe(callback);
  }, []);

  const getSnapshot = React.useCallback(() => {
    return {
      time: timelineManager.getTime(),
      speed: timelineManager.getSpeed(),
    };
  }, []);

  return React.useSyncExternalStore(subscribe, getSnapshot);
}

export const setSpeed = (speed: number | ((speed: number) => number)) => {
  timelineManager.setSpeed(speed);
}

export const addTicker = (callback: (time: number, deltaTime: number) => void) => {
  const tickerCallback = (time: number, deltaTime: number) => {
    timelineManager.updateTime(deltaTime);
    callback(timelineManager.getTime(), deltaTime);
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
