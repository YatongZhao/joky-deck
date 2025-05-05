import { useEffect, useRef } from "react";
import { viewBoxA$, viewBoxB$ } from "./store";
import { combineLatest } from "rxjs";

export const ExportViewBoxController = ({ id }: { id?: string }) => {
  const ref = useRef<SVGPathElement>(null);
  
  useEffect(() => {
    const subscription = combineLatest([viewBoxA$, viewBoxB$]).subscribe(([a, b]) => {
      console.log(a, b);
      if (ref.current) {
        ref.current.setAttribute('d', `M ${a[0]} ${a[1]} L ${b[0]} ${a[1]} L ${b[0]} ${b[1]} L ${a[0]} ${b[1]} Z`);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  return (
    <path
      id={id}
      ref={ref}
      stroke="none"
      strokeWidth="1"
      fill="white"
    />
  )
}
