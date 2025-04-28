import { v4 } from "uuid";
import { GearData } from "./core/types.";
import { Gear } from "./Gear";
import { useEffect, useRef, useState } from "react";
import { combineLatest, debounceTime, fromEvent } from "rxjs";
import { useGearProjectStore, useGear, useGearChildren } from "./store";
import { useMode, Mode } from "./hooks/useMode";
import { getScale } from "./core/coordinate";

export const GearProjectItem: React.FC<{ gearId: string; }> = ({ gearId }) => {
  const ref = useRef<SVGPathElement>(null);
  const svgMatrix$ = useGearProjectStore((state) => state.svgMatrix$);
  const gearProject = useGearProjectStore((state) => state.gearProject);
  const activeGearId = useGearProjectStore((state) => state.activeGearId);
  const setActiveGearId = useGearProjectStore((state) => state.setActiveGearId);
  const addGear = useGearProjectStore((state) => state.addGear);
  const setAddModeEnabled = useGearProjectStore((state) => state.setAddModeEnabled);
  const gearData = useGear(gearId);
  const gearChildren = useGearChildren(gearId);
  const mode = useMode();

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
      if (!active || mode !== Mode.Add) return;
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
  }, [gearData?.teeth, gearProject.module, active, mode, svgMatrix$]);

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
    onClick={() => setActiveGearId(prev => prev === gearData.id ? null : gearData.id)}
  >
    {gearChildren.map(child => <GearProjectItem key={child.id} gearId={child.id} />)}
    {active && mode === Mode.Add && virtualGearChild.teeth > 1 && (
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
          setActiveGearId(prev => prev === gearData.id ? null : gearData.id)
          setAddModeEnabled(false);
        }}
        virtual
      />
    )}
  </Gear>
}
