import { NumberCardA } from "../components/NumberCardA";
import { useGame } from "../GameContext"
import { useValue } from "../hooks/useValue";

export const RoundNumberCard = () => {
    const game = useGame();
    const roundNumber = useValue(game.roundNumber);

    return <NumberCardA c="orange.5" label="Round" value={roundNumber} />
}
