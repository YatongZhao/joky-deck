import { useEffect, useState } from "react";
import { ValueShape } from "@yatongzhao/joky-deck-core";

export const useValue = <T,>(gameValue: ValueShape<T>) => {
  const [value, setValue] = useState<T>(gameValue.value!);
  useEffect(() => {
    const handle = gameValue.value$.subscribe((value) => setValue(value));
    return () => handle.unsubscribe();
  }, [gameValue.value$]);

  return value;
}
