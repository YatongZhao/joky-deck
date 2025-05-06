import { useEffect } from "react";
import { finalMatrix$, viewBoxA$, viewBoxB$ } from "./store";
import { combineLatest } from "rxjs";
import { EditorMachineContext } from "./editorMachine";
import { useDrag } from "./hooks/useDrag";
import { vec2, mat3 } from "gl-matrix";

export const ExportViewBoxController = ({ id }: { id?: string }) => {
  const state = EditorMachineContext.useSelector((state) => state);
  const isViewportSetting = state.matches("ViewportSetting");
  const { ref, deltaMatrix$ } = useDrag<SVGPathElement>();
  
  useEffect(() => {
    const subscription = combineLatest([viewBoxA$, viewBoxB$]).subscribe(([a, b]) => {
      if (ref.current) {
        ref.current.setAttribute('d', `M ${a[0]} ${a[1]} L ${b[0]} ${a[1]} L ${b[0]} ${b[1]} L ${a[0]} ${b[1]} Z`);
      }
    });
    return () => subscription.unsubscribe();
  }, [ref]);

  useEffect(() => {
    const subscription = deltaMatrix$.subscribe((deltaMatrix) => {
      const screenPositionA = vec2.create();
      vec2.transformMat3(screenPositionA, viewBoxA$.getValue(), finalMatrix$.getValue());
      vec2.transformMat3(screenPositionA, screenPositionA, deltaMatrix);
      vec2.transformMat3(viewBoxA$.getValue(), screenPositionA, mat3.invert(mat3.create(), finalMatrix$.getValue()));
      viewBoxA$.next(viewBoxA$.getValue());
      
      const screenPositionB = vec2.create();
      vec2.transformMat3(screenPositionB, viewBoxB$.getValue(), finalMatrix$.getValue());
      vec2.transformMat3(screenPositionB, screenPositionB, deltaMatrix);
      vec2.transformMat3(viewBoxB$.getValue(), screenPositionB, mat3.invert(mat3.create(), finalMatrix$.getValue()));
      viewBoxB$.next(viewBoxB$.getValue());
    });
    return () => subscription.unsubscribe();
  }, [deltaMatrix$]);

  return (
    <path
      id={id}
      style={{
        cursor: isViewportSetting ? "grab" : "default",
      }}
      ref={ref}
      stroke="none"
      strokeWidth="1"
      fill="rgba(255, 255, 255, 1)"
      filter="drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))"
    />
  )
}
