import { useEffect, useRef } from "react";
import { globalViewBox$, viewBoxA$, viewBoxB$ } from "./store";
import { combineLatest } from "rxjs";

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
    const subscription = combineLatest([
      viewBoxA$, viewBoxB$
    ]).subscribe(([viewBoxA, viewBoxB]) => {
      if (!exportViewBoxRef.current) return;

      exportViewBoxRef.current.setAttribute('width', `${viewBoxB[0] - viewBoxA[0]}`);
      exportViewBoxRef.current.setAttribute('height', `${viewBoxB[1] - viewBoxA[1]}`);
      exportViewBoxRef.current.setAttribute('x', `${viewBoxA[0]}`);
      exportViewBoxRef.current.setAttribute('y', `${viewBoxA[1]}`);
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
