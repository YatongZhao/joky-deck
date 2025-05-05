import { mat3 } from "gl-matrix";
import { useCallback, useEffect, useRef, useState } from "react";
import { BehaviorSubject } from "rxjs";

export const useDrag = <T extends SVGElement>(middleButton: boolean = false) => {
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

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (middleButton && event.button !== 1) return;
    event.preventDefault();
    setDragState({ isDragging: true });
    translate([0, 0]);
  }, [translate, middleButton]);


  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragState.isDragging) return;
    translate([event.movementX, event.movementY]);
  }, [dragState.isDragging, translate]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false });
  }, [setDragState]);

  useEffect(() => {
    if (!ref.current) return;
    const target = ref.current;

    target.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      target.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, ref]);

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
