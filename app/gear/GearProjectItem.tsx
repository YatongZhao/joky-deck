import { v4 } from "uuid";
import { GearData } from "./core/types.";
import { Gear } from "./Gear";
import { useEffect, useRef, useState } from "react";
import { combineLatest, debounceTime, fromEvent } from "rxjs";
import { useGearProjectStore, useGear, useGearChildren, svgMatrix$ } from "./store";
import { getScale } from "./core/coordinate";
import { useSelector } from "@xstate/react";

export const GearProjectItem: React.FC<{ gearId: string; }> = ({ gearId }) => {
  const ref = useRef<SVGPathElement>(null);
  const gearProject = useGearProjectStore((state) => state.gearProject);
  const addGear = useGearProjectStore((state) => state.addGear);
  const gearData = useGear(gearId);
  const gearChildren = useGearChildren(gearId);
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const { send } = editorMachineActor;
  const state = useSelector(editorMachineActor, (state) => state);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const [virtualGearChild, setVirtualGearChild] = useState<GearData>({
    id: v4(),
    teeth: 1,
    parentId: gearId,
    positionAngle: 0,
  });

  const active = gearData?.id === activeGearId;

  useEffect(() => {
    setVirtualGearChild(prev => ({
      ...prev,
      teeth: 1,
    }));
    const subscription = combineLatest([fromEvent<MouseEvent>(window, 'mousemove'), svgMatrix$]).pipe(debounceTime(5)).subscribe(([event, matrix]) => {
      if (!active || !state.matches({ Selecting: { GearSelected: "AddingGear" } })) return;
      if (!ref.current) return;

      const { x, y, width, height } = ref.current.getBoundingClientRect();
      const scale = getScale(matrix)[0];

      const distance = Math.hypot(event.clientX - x - width / 2, event.clientY - y - height / 2);
      const angle = Math.atan2(event.clientY - y - height / 2, event.clientX - x - width / 2);
      const virtualGearChildTeeth = Math.round(distance / gearProject.module / scale - (gearData?.teeth ?? 0) / 2) * 2;

      setVirtualGearChild(prev => ({
        ...prev,
        teeth: virtualGearChildTeeth,
        positionAngle: 360 * angle / (2 * Math.PI),
      }));
    });

    return () => subscription.unsubscribe();
  }, [gearData?.teeth, gearProject.module, active, state]);

  if (!gearData) {
    return `Error: Gear(${gearId}) not found`;
  }

  return <Gear
    id={gearData.id}
    ref={ref}
    key={`${gearData.id}-${gearData.teeth}-${gearData.positionAngle}`}
    teeth={gearData.teeth}
    positionAngle={gearData.positionAngle}
    color={gearData.color}
    module={gearProject.module}
    durationUnit={gearProject.durationUnit}
    onClick={() => send({ type: 'selectGear', gearId: gearData.id })}
  >
    {gearChildren.map(child => <GearProjectItem key={child.id} gearId={child.id} />)}
    {active && state.matches({ Selecting: { GearSelected: "AddingGear" } }) && virtualGearChild.teeth > 1 && (
      <Gear
        id={virtualGearChild.id}
        key={`${virtualGearChild.teeth}-${virtualGearChild.positionAngle}-${virtualGearChild.color}`}
        teeth={virtualGearChild.teeth}
        positionAngle={virtualGearChild.positionAngle}
        module={gearProject.module}
        durationUnit={gearProject.durationUnit}
        onClick={() => {
          addGear(virtualGearChild);
          setVirtualGearChild({
            ...virtualGearChild,
            id: v4(),
          });
          send({ type: 'selectGear', gearId: gearData.id });
        }}
        virtual
      />
    )}
  </Gear>
}
