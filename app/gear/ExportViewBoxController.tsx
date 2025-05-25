import { useCallback, useEffect } from "react";
import { finalMatrix$, displayMatrix$, viewBox$, viewBoxNext } from "./store";
import { useSelector } from "@xstate/react";
import { useDrag } from "./hooks/useDrag";
import { vec2, mat3 } from "gl-matrix";
import { useMantineTheme } from "@mantine/core";
import { getScale } from "./core/coordinate";
import { useAppSelector, useAppDispatch } from "./store/redux";
import { editorMachineSelector, editorMachineSendSelector } from "./store/redux/slices/editorMachineSlice";
import { persistViewBox } from "./store/redux/slices/viewBoxSlice";

export const ExportViewBoxController = ({ id }: { id?: string }) => {
  const theme = useMantineTheme();
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const isViewportSetting = useSelector(editorMachineActor, (state) => state.matches("ViewportSetting"));
  const dispatch = useAppDispatch();
  const handleDragEnd = useCallback(() => {
    dispatch(persistViewBox(viewBox$.getValue()));
  }, [dispatch]);
  const { ref, deltaMatrix$ } = useDrag<SVGPathElement>({ onDragEnd: handleDragEnd, disabled: !isViewportSetting });
  
  useEffect(() => {
    const subscription = viewBox$.subscribe(({ x1, y1, x2, y2 }) => {
      if (ref.current) {
        ref.current.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`);
      }
    });
    return () => subscription.unsubscribe();
  }, [ref]);

  useEffect(() => {
    if (!isViewportSetting) return;
    const subscription = deltaMatrix$.subscribe((deltaMatrix) => {
      const { x1, y1, x2, y2 } = viewBox$.getValue();
      const point = vec2.create();
      vec2.transformMat3(point, vec2.fromValues(x1, y1), finalMatrix$.getValue());
      vec2.transformMat3(point, point, deltaMatrix);
      vec2.transformMat3(point, point, mat3.invert(mat3.create(), finalMatrix$.getValue()));
      viewBoxNext({ x1: point[0], y1: point[1] });
      
      vec2.transformMat3(point, vec2.fromValues(x2, y2), finalMatrix$.getValue());
      vec2.transformMat3(point, point, deltaMatrix);
      vec2.transformMat3(point, point, mat3.invert(mat3.create(), finalMatrix$.getValue()));
      viewBoxNext({ x2: point[0], y2: point[1] });
    });
    return () => subscription.unsubscribe();
  }, [deltaMatrix$, isViewportSetting]);

  useEffect(() => {
    const subscription = displayMatrix$.subscribe((matrix) => {
      const scale = getScale(matrix);
      if (!ref.current) return;
      const target = ref.current;
      target.setAttribute('stroke-width', `${1 / scale[0]}`);
      target.setAttribute('stroke-dasharray', isViewportSetting ? `${2 / scale[0]} ${2 / scale[0]}` : "none");
    });
    return () => subscription.unsubscribe();
  }, [ref, isViewportSetting]);

  return (
    <path
      id={id}
      style={{
        cursor: isViewportSetting ? "grab" : "default",
      }}
      onClick={() => {
        editorMachineSend({ type: 'unselectGear' });
      }}
      ref={ref}
      stroke={isViewportSetting ? "black" : theme.colors.gray[4]}
      fill={isViewportSetting ? "rgba(255, 255, 255, 0)" : "white"}
      filter="drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))"
    />
  )
}
