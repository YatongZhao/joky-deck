import { Card } from "@mantine/core";
import { forwardRef, ReactNode, useRef } from "react";
import { useTheme } from "../theme";

export const CardContainer = forwardRef<
  HTMLDivElement,
  {
    active?: boolean;
    onClick?: () => void;
    children?: ReactNode;
  }
>(function CardContainer({ active, onClick, children }, ref) {
  const nonMoveClick = useRef({ bool: false, timestamp: 0 });
  const clickPos = useRef({ x: 0, y: 0 });
  const theme = useTheme();

  return (
    <Card
      ref={ref}
      w={60}
      h={80}
      p={5}
      style={{
        cursor: 'pointer',
        position: 'relative',
        bottom: active ? 20 : 0,
        userSelect: 'none',
        overflow: 'visible',
        borderWidth: 2,
        borderColor: theme.colors.gameMain?.[7],
        borderStyle: 'solid',
      }}
      radius="sm"
      onMouseDown={(e) => {
        clickPos.current = {
          x: e.screenX,
          y: e.screenY,
        };
        nonMoveClick.current.bool = true;
        nonMoveClick.current.timestamp = performance.now();
      }}
      onMouseMove={() => {
        if (performance.now() - nonMoveClick.current.timestamp > 120) {
          nonMoveClick.current.bool = false;
        }
      }}
      onClick={(e) => {
        if ((e.screenX - clickPos.current.x) ** 2 + (e.screenY - clickPos.current.y) ** 2 > 100) return;
        if (!nonMoveClick.current.bool) return;
        onClick?.();
      }}
    >
      {children}
    </Card>
  );
});
