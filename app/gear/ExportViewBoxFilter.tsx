import { useEffect, useRef } from "react";
import { globalViewBox$, viewBox$ } from "./store";

export const ExportViewBoxFilter: React.FC<{
  filterId: string;
  maskId: string;
}> = ({ filterId, maskId }) => {
  const globalViewBoxMaskRef = useRef<SVGRectElement>(null);
  const exportViewBoxRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const subscription = globalViewBox$.subscribe((viewBox) => {
      if (!globalViewBoxMaskRef.current) return;

      globalViewBoxMaskRef.current.setAttribute('width', `${viewBox.width}`);
      globalViewBoxMaskRef.current.setAttribute('height', `${viewBox.height}`);
      globalViewBoxMaskRef.current.setAttribute('x', `${viewBox.x}`);
      globalViewBoxMaskRef.current.setAttribute('y', `${viewBox.y}`);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = viewBox$.subscribe(({ x1, y1, x2, y2 }) => {
      if (!exportViewBoxRef.current) return;

      exportViewBoxRef.current.setAttribute('width', `${Math.abs(x2 - x1)}`);
      exportViewBoxRef.current.setAttribute('height', `${Math.abs(y2 - y1)}`);
      exportViewBoxRef.current.setAttribute('x', `${Math.min(x1, x2)}`);
      exportViewBoxRef.current.setAttribute('y', `${Math.min(y1, y2)}`);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <filter id={filterId}>
        <feComponentTransfer>
          <feFuncA type="linear" slope="1" intercept="0" />
        </feComponentTransfer>
      </filter>

      <mask id={maskId}>
        <rect ref={exportViewBoxRef} fill="white" fillOpacity="1" />
        <rect ref={globalViewBoxMaskRef} fill="white" fillOpacity="0.2" />
      </mask>
    </>
  );
}
