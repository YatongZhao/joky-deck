import { useCallback, useEffect, useMemo, useRef } from "react";
import { Value } from "@yatongzhao/joky-deck-core";
import { useValue } from "../hooks/useValue";
import { move } from "ramda";
import { BehaviorSubject } from "rxjs";

export const useDraggableCards = <C extends {
  id: string;
},>({ cards$, gap = 120, gapY = 120, wrap = false, columns = 3 }: {
  cards$: Value<C[]>;
  gap?: number;
  gapY?: number;
  wrap?: boolean;
  columns?: number;
}) => {
  const cards = useValue(cards$);

  const positionSignalMapRef = useRef<Record<string, BehaviorSubject<{ x: number; y: number; }>>>({});
  const positionSignalMap = useMemo(() => {
    console.log('positionSignalMap');
    const map: Record<string, BehaviorSubject<{ x: number; y: number; }>> = {};

    cards.forEach((card) => {
      if (!positionSignalMapRef.current[card.id]) {
        positionSignalMapRef.current[card.id] = new BehaviorSubject({ x: 0, y: -100 });
      }

      map[card.id] = positionSignalMapRef.current[card.id];
    });

    for (const id in positionSignalMapRef.current) {
      if (!cards.find(card => card.id === id)) {
        delete positionSignalMapRef.current[id];
      }
    }

    return map;
  }, [cards]);

  const getX = useCallback((i: number) => {
    return wrap ? (i % columns) * gap : i * gap;
  }, [gap, wrap, columns]);

  const getY = useCallback((i: number) => {
    return wrap ? ~~(i / columns) * gapY : 0;
  }, [gapY, wrap, columns]);

  useEffect(() => {
    cards.forEach((card, i) => {
      positionSignalMap[card.id].next({
        x: getX(i),
        y: getY(i),
      });
    });
  }, [cards, positionSignalMap, getX, getY]);

  const getTargetI = useCallback((i: number, diffI: number) => {
    let targetI = i + diffI;
    targetI > cards$.value.length - 1 && (targetI = cards$.value.length - 1);
    targetI < 0 && (targetI = 0);

    return targetI;
  }, [cards$.value.length]);

  const handleDrag = useCallback((index: number, props: { active: boolean; movement: [number, number]; }) => {
    const active = props.active;
    const [x, y] = props.movement;
    const diffY = ~~(y / gapY);
    const diffX = ~~(x / gap);
    const diffI = diffY * columns + diffX;

    cards$.value.forEach((card, i) => {
      const targetDiffI = i - index;
      let newIndex = i;

      if (Math.abs(targetDiffI) <= Math.abs(diffI) && targetDiffI * diffI > 0) {
        newIndex = diffI > 0 ? i - 1 : i + 1;
      }

      positionSignalMap[card.id].next({
        x: getX(newIndex),
        y: getY(newIndex),
      });
    });

    if (!active) {
      if (index === getTargetI(index, diffI)) return;

      cards$.setValue(move(index, getTargetI(index, diffI), cards$.value));
    }
  }, [cards$, gap, getTargetI, positionSignalMap, getX, getY, columns, gapY]);

  return { handleDrag, positionSignalMap };
}
