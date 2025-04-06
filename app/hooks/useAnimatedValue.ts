import anime from "animejs";
import { useEffect, useRef } from "react";
import { Value } from "@yatongzhao/joky-deck-core";
import { useSpringValue, easings } from "@react-spring/web";

export const useAnimatedValue = <T extends HTMLElement>(target: Value<number>, duration = 100) => {
  const ref = useRef<T>(null);
  const valueRef = useRef(target.value);
  useEffect(() => {
    const subscription = target.value$.subscribe(value => {
      anime({
        targets: valueRef,
        current: value,
        round: 1,
        easing: 'cubicBezier(.5, .05, .1, .3)',
        duration,
        update: () => {
          if (ref.current) {
            ref.current.innerText = valueRef.current.toString();
          }
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [target, duration]);

  return ref;
}

export const useAnimatedValue1 = <T extends HTMLElement>(target: Value<number>, duration = 100) => {
  const ref = useRef<T>(null);
  const valueRef = useSpringValue(target.value, {
    config: {
      duration,
      easing: easings.easeOutCubic,
    },
    onChange(value) {
      if (ref.current) {
        ref.current.innerText = Number(value).toFixed(0);
      }
    }
  });
  useEffect(() => {
    const subscription = target.value$.subscribe(value => {
      valueRef.start(value);
    });

    return () => subscription.unsubscribe();
  }, [target, valueRef]);

  return ref;
}
