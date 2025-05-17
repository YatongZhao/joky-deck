import { GearData } from "./core/types";
import { useSelector } from "@xstate/react";
import { GearEntity } from "./GearEntity";
import { finalMatrix$, useEditorMachineSend, useGear, useGearProjectStore, useGearSvgPosition } from "./store";
import { useTheme } from "./theme";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import { GearType } from "./core/types";
import { mat3, vec2 } from "gl-matrix";
import { getGearTransformVector } from "./core/gear";
import { debounceTime } from "rxjs/operators";
import { fromEvent } from "rxjs";
import { combineLatest } from "rxjs";

export type GearParserProps = {
  gearId: string;
}

export const GearParser = ({ gearId }: GearParserProps) => {
  const theme = useTheme();
  const gearData = useGear(gearId);
  const gearProjectModule = useGearProjectStore(state => state.gearProject.module);
  const position = useGearSvgPosition(gearId);
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const send = useEditorMachineSend();

  const handleClick = useCallback(() => {
    send({
      type: 'selectGear',
      gearId,
    });
  }, [send, gearId]);

  if (!gearData) {
    return null;
  }

  return <GearEntity
    transform={`translate(${position[0]}, ${position[1]})`}
    teeth={gearData.teeth}
    module={gearProjectModule}
    withHole
    fillColor={gearData.color || theme.colors.gray[4]}
    active={activeGearId === gearId}
    onClick={handleClick}
  />
}

export const GearToAdd = () => {
  const theme = useTheme();
  const send = useEditorMachineSend();
  const addGear = useGearProjectStore(state => state.addGear);
  const gearProjectModule = useGearProjectStore(state => state.gearProject.module);
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const [virtualGearChild, setVirtualGearChild] = useState<GearData>({
    id: v4(),
    type: GearType.Relative,
    teeth: 3,
    parentId: activeGearId,
    positionAngle: 0,
    position: vec2.create(),
  });
  const activeGearSvgPosition = useGearSvgPosition(activeGearId);
  const activeGear = useGear(activeGearId);
  const pushUndo = useGearProjectStore(state => state.pushUndo);
  const virtualGearSvgPosition = useMemo(() => {
    const transformMatrix = mat3.create();
    mat3.translate(transformMatrix, transformMatrix, getGearTransformVector(virtualGearChild.positionAngle, virtualGearChild.teeth, activeGear?.teeth ?? 0, gearProjectModule));
    return vec2.transformMat3(vec2.create(), activeGearSvgPosition, transformMatrix);
  }, [activeGearSvgPosition, activeGear?.teeth, gearProjectModule, virtualGearChild.positionAngle, virtualGearChild.teeth]);


  useEffect(() => {
    const subscription = combineLatest([fromEvent<MouseEvent>(window, 'mousemove'), finalMatrix$]).pipe(debounceTime(5)).subscribe(([event, matrix]) => {
      const mouseGlobalPosition = vec2.fromValues(event.clientX, event.clientY);
      const reverseMatrix = mat3.create();
      mat3.invert(reverseMatrix, matrix);
      const mouseSvgPosition = vec2.transformMat3(vec2.create(), mouseGlobalPosition, reverseMatrix);

      const distance = Math.hypot(mouseSvgPosition[0] - activeGearSvgPosition[0], mouseSvgPosition[1] - activeGearSvgPosition[1]);
      const angle = Math.atan2(mouseSvgPosition[1] - activeGearSvgPosition[1], mouseSvgPosition[0] - activeGearSvgPosition[0]);
      const virtualGearChildTeeth = Math.round(distance / gearProjectModule - (activeGear?.teeth ?? 0) / 2) * 2;

      setVirtualGearChild(prev => ({
        ...prev,
        teeth: virtualGearChildTeeth < 3 ? 3 : virtualGearChildTeeth,
        positionAngle: 360 * angle / (2 * Math.PI),
      }));
    });

    return () => subscription.unsubscribe();
  }, [gearProjectModule, activeGear?.teeth, activeGearSvgPosition]);

  const handleClick = useCallback(() => {
    addGear(virtualGearChild);
    setVirtualGearChild({
      ...virtualGearChild,
      id: v4(),
    });
    if (activeGearId) {
      send({
        type: 'selectGear',
        gearId: activeGearId,
      });
    }
    pushUndo("Add Gear");
  }, [virtualGearChild, addGear, send, activeGearId, pushUndo]);

  return <GearEntity
    transform={`translate(${virtualGearSvgPosition[0]}, ${virtualGearSvgPosition[1]})`}
    teeth={virtualGearChild.teeth}
    module={gearProjectModule}
    withHole={false}
    fillColor={theme.colors.blue[4]}
    active
    onClick={handleClick}
  />
}
