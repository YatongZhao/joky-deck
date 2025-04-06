import { DependencyList, useCallback, useEffect, useState } from "react";
import { Subject, filter } from "rxjs";
import { v4 } from "uuid";

export const useCurrentCallback = <T,>(cb: (param: T) => void, deps: DependencyList) => {
    const callback = useCallback(cb, [...deps, cb]);
    const [cbSignal] = useState(new Subject<string>());
    const [signal] = useState(new Subject<{ param: T; runId: string }>());
    useEffect(() => {
      const handle = signal.subscribe(async ({ param, runId }) => {
        await callback(param);
        cbSignal.next(runId);
      });
      return () => handle.unsubscribe();
    }, [signal, callback, cbSignal]);
    const currentCallback = useCallback((param: T) => {
      let resolve: (value: unknown) => void;
      const promise = new Promise((_resolve) => resolve = _resolve);
      const runId = v4();
      const handle = cbSignal.pipe(filter(_runId => _runId === runId)).subscribe(() => {
        resolve(null);
        handle.unsubscribe();
      });
      signal.next({ param, runId });
  
      return promise;
    }, [cbSignal, signal]);
  
    return currentCallback;
}
