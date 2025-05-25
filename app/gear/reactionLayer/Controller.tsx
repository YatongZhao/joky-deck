import { ActionIcon, Button, Group, NumberFormatter } from "@mantine/core"
import { HelpCircle, Minus, Pause, Play, Plus, Redo, Undo } from "lucide-react"
import classes from "./Controller.module.scss";
import { useScaleController } from "./hooks/useScaleController";
import { REACTION_LAYER_OFFSET } from "../constant";
import { useUndoController } from "./hooks/useUndoController";
import { useTimelineController } from "./hooks/useTimelineController";
import { HelpShortcuts } from "./HelpShortcuts";

export const Controller = () => {
  const { undo, redo, canUndo, canRedo } = useUndoController();
  const { scale, increaseScaleBy10, decreaseScaleBy10, resetScale } = useScaleController();
  const { isPlaying, togglePlay } = useTimelineController();

  return (
    <>
      <Group pos="fixed" bottom={REACTION_LAYER_OFFSET} left={REACTION_LAYER_OFFSET}>
        <Button.Group>
          <Button variant="light" c="dark" size="compact-sm" className={classes.button} onClick={decreaseScaleBy10}>
            <Minus size={16} />
          </Button>
          <Button variant="light" c="dark" size="compact-sm" className={classes.button} onClick={resetScale}>
            <NumberFormatter value={scale * 100} suffix="%" decimalScale={0} />
          </Button>
          <Button variant="light" c="dark" size="compact-sm" className={classes.button} onClick={increaseScaleBy10}>
            <Plus size={16} />
          </Button>
        </Button.Group>
        <ActionIcon.Group>
          <ActionIcon variant="light" c="dark" onClick={undo} disabled={!canUndo} className={classes.button}>
            <Undo size={16} />
          </ActionIcon>
          <ActionIcon variant="light" c="dark" onClick={redo} disabled={!canRedo} className={classes.button}>
            <Redo size={16} />
          </ActionIcon>
        </ActionIcon.Group>
      </Group>
      {/* Timeline Controller */}
      <Group pos="fixed" bottom={REACTION_LAYER_OFFSET} left="50%" style={{ transform: "translateX(-50%)" }}>
        <ActionIcon 
          variant="light" 
          c="dark" 
          className={classes.button}
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" />}
        </ActionIcon>
      </Group>
      {/* Shortcuts */}
      <Group pos="fixed" bottom={REACTION_LAYER_OFFSET} right={REACTION_LAYER_OFFSET}>
        <HelpShortcuts />
      </Group>
    </>
  )
}
