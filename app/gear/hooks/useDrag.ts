import { mat3 } from "gl-matrix";
import { useCallback, useEffect, useRef, useState } from "react";
import { BehaviorSubject } from "rxjs";

type UseDragProps = {
  middleButton?: boolean;
  onDragEnd?: () => void;
}
export const useDrag = <T extends SVGElement>({ middleButton = false, onDragEnd }: UseDragProps = {}) => {
  const ref = useRef<T>(null);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false });
  const [deltaMatrix$] = useState(new BehaviorSubject<mat3>(mat3.create()));
  const [translateMatrix$] = useState(new BehaviorSubject<mat3>(mat3.create()));

  const translate = useCallback(([x, y]: [number, number]) => {
    const matrix = translateMatrix$.getValue();
    const translateMatrix = mat3.create();
    mat3.translate(translateMatrix, translateMatrix, [x, y]);
    mat3.multiply(matrix, translateMatrix, matrix);
    translateMatrix$.next(matrix);
    deltaMatrix$.next(translateMatrix);
  }, [translateMatrix$, deltaMatrix$]);

  useEffect(() => {
    if (!ref.current) return;
    const target = ref.current;
    const handleMouseDown = (event: MouseEvent) => {
      if (middleButton && event.button !== 1) return;
      if (!middleButton && event.button !== 0) return;
      event.preventDefault();
      setDragState({ isDragging: true });
      translate([0, 0]);
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragState.isDragging) return;
      translate([event.movementX, event.movementY]);
    }

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        setDragState({ isDragging: false });
        onDragEnd?.();
      }
    }

    target.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      target.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [middleButton, translate, ref, onDragEnd, dragState.isDragging]);

  return {
    dragState,
    translateMatrix$,
    deltaMatrix$,
    ref,
  };
};

interface DragState {
  isDragging: boolean;
}
