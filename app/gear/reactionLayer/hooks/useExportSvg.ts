import { useCallback } from "react";
import { saveAs } from "file-saver";
import { __internal_gear_project_id__, __internal_view_box_controller_id__ } from "../../constant";
import { viewBox$ } from "../../store";

export const useExportSvg = () => {
  return useCallback(() => {
    const svgEl = document.getElementById(__internal_gear_project_id__);
    if (!svgEl) return;
    const svgData = (svgEl.cloneNode(true) as SVGSVGElement);
    const { x1, y1, x2, y2 } = viewBox$.getValue();
    svgData.setAttribute('viewBox', `${Math.min(x1, x2)} ${Math.min(y1, y2)} ${Math.abs(x2 - x1)} ${Math.abs(y2 - y1)}`);
    svgData.setAttribute('width', `${Math.abs(x2 - x1)}`);
    svgData.setAttribute('height', `${Math.abs(y2 - y1)}`);
    svgData.removeChild(svgData.getElementById(__internal_view_box_controller_id__));
    if (!svgData) return;
    saveAs(new Blob([svgData.outerHTML], { type: 'image/svg+xml' }), 'gear-project.svg');
  }, []);
}
