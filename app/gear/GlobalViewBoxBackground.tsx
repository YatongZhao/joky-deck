import { useEffect, useRef } from "react";
import { globalViewBox$, useEditorMachineSend } from "./store";
import { useAppSelector } from "./store/redux";
import { editorMachineSendSelector } from "./store/redux/slices/editorMachineSlice";

export const GlobalViewBoxBackground = () => {
  const ref = useRef<SVGRectElement>(null);
  const send = useEditorMachineSend();
  const editorMachineSend = useAppSelector(editorMachineSendSelector);

  useEffect(() => {
    const subscription = globalViewBox$.subscribe((viewBox) => {
      if (!ref.current) return;
      ref.current.setAttribute('width', `${viewBox.width}`);
      ref.current.setAttribute('height', `${viewBox.height}`);
      ref.current.setAttribute('x', `${viewBox.x}`);
      ref.current.setAttribute('y', `${viewBox.y}`);
    });
    return () => subscription.unsubscribe();
  }, []);
  return (
    <rect onClick={() => {
      send({ type: 'unselectGear' });
      editorMachineSend({ type: 'unselectGear' });
    }} ref={ref} fill="rgba(0, 0, 0, 0)" />
  )
}
