import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, fromEvent, map, merge, of } from "rxjs";
import { preloadedGearProjectData } from "./redux/preloadedGearProjectData";
import { mat3, vec2 } from "gl-matrix";
import { matrixToMat3 } from "../utils";

// State synced with redux
export const displayMatrix$ = new BehaviorSubject<mat3>(matrixToMat3(preloadedGearProjectData.displayMatrix));
export const viewBox$ = new BehaviorSubject(preloadedGearProjectData.viewBox);

export const viewBoxNext = (value: Partial<{ x1: number, y1: number, x2: number, y2: number }>) => viewBox$.next({ ...viewBox$.getValue(), ...value });

export const viewBoxA$ = new BehaviorSubject<vec2>(vec2.fromValues(preloadedGearProjectData.viewBox.x1, preloadedGearProjectData.viewBox.y1));
export const viewBoxB$ = new BehaviorSubject<vec2>(vec2.fromValues(preloadedGearProjectData.viewBox.x2, preloadedGearProjectData.viewBox.y2));
export const viewBoxC$ = new BehaviorSubject<vec2>(vec2.fromValues(preloadedGearProjectData.viewBox.x1, preloadedGearProjectData.viewBox.y2));
export const viewBoxD$ = new BehaviorSubject<vec2>(vec2.fromValues(preloadedGearProjectData.viewBox.x2, preloadedGearProjectData.viewBox.y1));

const viewBoxX1$ = viewBox$.pipe(map((value) => value.x1), distinctUntilChanged());
const viewBoxY1$ = viewBox$.pipe(map((value) => value.y1), distinctUntilChanged());
const viewBoxX2$ = viewBox$.pipe(map((value) => value.x2), distinctUntilChanged());
const viewBoxY2$ = viewBox$.pipe(map((value) => value.y2), distinctUntilChanged());

combineLatest([viewBoxX1$, viewBoxY1$]).pipe(map(([x1, y1]) => vec2.fromValues(x1, y1))).subscribe(viewBoxA$);
combineLatest([viewBoxX2$, viewBoxY2$]).pipe(map(([x2, y2]) => vec2.fromValues(x2, y2))).subscribe(viewBoxB$);
combineLatest([viewBoxX1$, viewBoxY2$]).pipe(map(([x1, y2]) => vec2.fromValues(x1, y2))).subscribe(viewBoxC$);
combineLatest([viewBoxX2$, viewBoxY1$]).pipe(map(([x2, y1]) => vec2.fromValues(x2, y1))).subscribe(viewBoxD$);

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
combineLatest([displayMatrix$, translateMatrix$]).subscribe(([displayMatrix, translateMatrix]) => {
  const finalMatrix = mat3.create();
  mat3.multiply(finalMatrix, translateMatrix, displayMatrix);
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

export const lastMousePosition$ = new BehaviorSubject({ clientX: 0, clientY: 0 });
fromEvent<MouseEvent>(window, 'mousemove').pipe(debounceTime(100)).subscribe((event) => {
  lastMousePosition$.next({ clientX: event.clientX, clientY: event.clientY });
});
