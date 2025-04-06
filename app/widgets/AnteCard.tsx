import { useGame } from "../GameContext"
import { useValue } from "../hooks/useValue";
import { NumberCardA } from "../components/NumberCardA";

export const AnteCard = () => {
    const game = useGame();
    const anteNumber = useValue(game.anteNumber);
    return <NumberCardA c="orange.5" label="Ante" value={anteNumber + 1} unit="/8" />
}
