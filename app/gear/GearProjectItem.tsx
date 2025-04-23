import { v4 } from "uuid";
import { useGearProject } from "./context";
import { GearData } from "./core/types.";
import { Gear } from "./Gear";
import { useEffect, useRef, useState } from "react";
import { debounceTime, fromEvent } from "rxjs";

export const GearProjectItem: React.FC<{ gearId: string; isRoot?: boolean }> = ({ gearId, isRoot = false }) => {
  const ref = useRef<SVGPathElement>(null);
  const { gearProject, activeGearId, setActiveGearId, addGear, scale } = useGearProject();
  const gearData = isRoot ? gearProject.rootGear : gearProject.gears.find(gear => gear.id === gearId);
  const gearChildren = gearProject.gears.filter(gear => gear.parentId === gearId);

  const [virtualGearChild, setVirtualGearChild] = useState<GearData>({
    id: v4(),
    teeth: 1,
    parentId: gearId,
    positionAngle: 0,
  });

  const active = gearData?.id === activeGearId;

  useEffect(() => {
    const subscription = fromEvent<MouseEvent>(window, 'mousemove').pipe(debounceTime(5)).subscribe((event) => {
      if (!active) return;
      if (!ref.current) return;

      const { x, y, width, height } = ref.current.getBoundingClientRect();

      const distance = Math.sqrt((event.clientX - x - width / 2) ** 2 + (event.clientY - y - height / 2) ** 2);
      const angle = Math.atan2(event.clientY - y - height / 2, event.clientX - x - width / 2);
      const virtualGearChildTeeth = Math.round(distance / gearProject.module * scale - (gearData?.teeth ?? 0) / 2) * 2;

      setVirtualGearChild(prev => ({
        ...prev,
        teeth: virtualGearChildTeeth,
        positionAngle: 360 * angle / (2 * Math.PI),
      }));
    });

    return () => subscription.unsubscribe();
  }, [gearData?.teeth, gearProject.module, active, scale]);

  if (!gearData) {
    return `Error: Gear(${gearId}) not found`;
  }

  return <Gear
    ref={ref}
    teeth={gearData.teeth}
    positionAngle={gearData.positionAngle}
    module={gearProject.module}
    durationUnit={gearProject.durationUnit}
    active={active}
    onClick={() => setActiveGearId(prev => prev === gearData.id ? null : gearData.id)}
  >
    {gearChildren.map(child => <GearProjectItem key={child.id} gearId={child.id} />)}
    {active && virtualGearChild.teeth > 0 && (
      <Gear
        key={`${virtualGearChild.teeth}-${virtualGearChild.positionAngle}`}
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
        }}
      />
    )}
  </Gear>
}
