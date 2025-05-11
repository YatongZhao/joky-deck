import { vec2 } from "gl-matrix";
import { viewBoxA$, viewBoxB$ } from "../../store";
import { useCallback } from "react";
import { saveAs } from "file-saver";
import { __internal_gear_project_id__, __internal_view_box_controller_id__ } from "../../constant";

// TODO: Not correct
export const useExportSvg = () => {
  return useCallback(() => {
    const svgEl = document.getElementById(__internal_gear_project_id__);
    if (!svgEl) return;
    const svgData = (svgEl.cloneNode(true) as SVGSVGElement);
    const viewBoxA = viewBoxA$.getValue();
    const viewBoxB = viewBoxB$.getValue();
    svgData.setAttribute('viewBox', viewBoxA.join(' ') + ' ' + vec2.sub(vec2.create(), viewBoxB, viewBoxA).join(' '));
    svgData.setAttribute('width', `${Math.abs(viewBoxB[0] - viewBoxA[0])}`);
    svgData.setAttribute('height', `${Math.abs(viewBoxB[1] - viewBoxA[1])}`);
    svgData.removeChild(svgData.getElementById(__internal_view_box_controller_id__));
    if (!svgData) return;
    saveAs(new Blob([svgData.outerHTML], { type: 'image/svg+xml' }), 'gear-project.svg');
  }, []);
}
