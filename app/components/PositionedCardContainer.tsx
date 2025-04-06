import { animated, useSpring } from "@react-spring/web";
import { ReactNode, forwardRef, useCallback, useEffect, useRef } from "react";
import { useDrag } from "react-use-gesture";
import { CardContainer } from "../components/CardContainer";
import { Subject } from "rxjs";
import { Effect } from "@yatongzhao/joky-deck-core";
import { useHover } from "@mantine/hooks";
import { useMergedRef } from "@mantine/hooks";

export const PositionedCardContainer = forwardRef<
  HTMLDivElement,
  {
    positionSignal: Subject<{ x: number; y: number; }>
    effect?: Effect;
    onClick?: () => void;
    onDrag?: (props: { active: boolean; movement: [number, number]; }) => void;
    active?: boolean;
    children?: ReactNode;
    info?: ReactNode;
    hoverToTop?: boolean;
  }
>(function PositionedCardContainer({ onClick, active, onDrag, children, positionSignal, effect, info, hoverToTop = false }, ref) {
  const [spring, api] = useSpring(() => ({ x: 800, y: 0 }));
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const { hovered, ref: hoverRef } = useHover();
  const mergedRef = useMergedRef(ref, hoverRef);

  const [emitEffectProps, emitEffectApi] = useSpring(() => ({
    scale: 1,
    rotate: 0,
  }));

  useEffect(() => {
    const handle = effect?.add(async () => {
      return Promise.all(emitEffectApi.start({
        from: { scale: 0.8, rotate: -10 },
        to: [
          { scale: 1, rotate: Math.random() * 8 - 4, config: { tension: 800, mass: 1, friction: 19, velocity: .01 } },
        ],
      }));
    });
    return () => handle?.remove();
  }, [effect, emitEffectApi]);

  const moveToTargetPosition = useCallback(async () => {
    if (!(spring.x.get() === targetPosition.current.x && spring.y.get() === targetPosition.current.y)) {
      effect?.emit();
    }
    api.start({
      ...targetPosition.current,
      config: {
        duration: 50,
      }
    });
    currentPosition.current = targetPosition.current;
  }, [api, spring, effect]);

  useEffect(() => {
    const handle = positionSignal.subscribe((position) => {
      targetPosition.current = position;
      if (!dragging.current) {
        moveToTargetPosition();
      }
    });
    return () => handle.unsubscribe();
  }, [positionSignal, moveToTargetPosition]);

  const bindDrag = useDrag(({ active, movement: [x, y] }) => {
    dragging.current = active;
    if (active) {
      api.start({
        x: currentPosition.current.x + x,
        y: currentPosition.current.y + y,
        immediate: true,
      });
    } else {
      moveToTargetPosition();
    }
    onDrag?.({ active, movement: [x, y] });
  });

  return (
    <animated.div ref={mergedRef} style={{
      ...spring,
      position: 'absolute',
      zIndex: hoverToTop ? (hovered ? 1000 : 'inherit') : 'inherit',
    }} {...bindDrag()}>
      <animated.div
        // onMouseEnter={() => effect?.emit()}
        style={{
          scale: emitEffectProps.scale,
          transform: emitEffectProps.rotate.to(rotate => `rotateZ(${rotate}deg)`)
        }}
      >
        <CardContainer active={active} onClick={onClick}>
          {children}
        </CardContainer>
      </animated.div>
      {info}
    </animated.div>
  );
});
