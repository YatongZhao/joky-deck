import { useCallback, useEffect } from "react";
import { finalMatrix$, svgMatrix$, viewBoxA$, viewBoxB$ } from "./store";
import { combineLatest } from "rxjs";
import { useSelector } from "@xstate/react";
import { useDrag } from "./hooks/useDrag";
import { vec2, mat3 } from "gl-matrix";
import { useMantineTheme } from "@mantine/core";
import { getScale } from "./core/coordinate";
import { useAppSelector, useAppDispatch } from "./store/redux";
import { editorMachineSelector, editorMachineSendSelector } from "./store/redux/slices/editorMachineSlice";
import { pushUndo } from "./store/redux/slices/undoManagerSlice";

export const ExportViewBoxController = ({ id }: { id?: string }) => {
  const theme = useMantineTheme();
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const isViewportSetting = useSelector(editorMachineActor, (state) => state.matches("ViewportSetting"));
  const dispatch = useAppDispatch();
  const handleDragEnd = useCallback(() => {
    dispatch(pushUndo("Export ViewBox Change"));
  }, [dispatch]);
  const { ref, deltaMatrix$ } = useDrag<SVGPathElement>({ onDragEnd: handleDragEnd, disabled: !isViewportSetting });
  
  useEffect(() => {
    const subscription = combineLatest([viewBoxA$, viewBoxB$]).subscribe(([a, b]) => {
      if (ref.current) {
        ref.current.setAttribute('d', `M ${a[0]} ${a[1]} L ${b[0]} ${a[1]} L ${b[0]} ${b[1]} L ${a[0]} ${b[1]} Z`);
      }
    });
    return () => subscription.unsubscribe();
  }, [ref]);

  useEffect(() => {
    if (!isViewportSetting) return;
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
  }, [deltaMatrix$, isViewportSetting]);

  useEffect(() => {
    const subscription = svgMatrix$.subscribe((matrix) => {
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
