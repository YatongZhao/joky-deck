import { vec2 } from "gl-matrix";
import { viewBoxA$, viewBoxB$, useGearProjectStore } from "../../store";
import { useCallback } from "react";
import { saveAs } from "file-saver";

// TODO: Not correct
export const useExportSvg = () => {
  const __internal_gear_project_id__ = useGearProjectStore((state) => state.__internal_gear_project_id__);
  return useCallback(() => {
    const svgEl = document.getElementById(__internal_gear_project_id__);
    if (!svgEl) return;
    const svgData = (svgEl.cloneNode(true) as SVGSVGElement);
    const viewBoxA = viewBoxA$.getValue();
    const viewBoxB = viewBoxB$.getValue();
    svgData.setAttribute('viewBox', viewBoxA.join(' ') + ' ' + vec2.sub(vec2.create(), viewBoxB, viewBoxA).join(' '));
    svgData.setAttribute('width', '');
    svgData.setAttribute('height', '');
    if (!svgData) return;
    saveAs(new Blob([svgData.outerHTML], { type: 'image/svg+xml' }), 'gear-project.svg');
  }, [__internal_gear_project_id__]);
}
