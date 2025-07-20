import AniItem, { type Ani } from './AniItem';
import {useCleared} from "@/hooks/useCleared.ts";


export default function AniList({ list }: { list: Ani[] }) {
    const {clear, clearedIds } = useCleared()
    const watchingToday = list.filter( ani => !clearedIds.has(ani.id))
    return (
        <div className="ani-list">
            {
                watchingToday.map(ani => (
                    <AniItem
                        key={ani.id}
                        ani={ani}
                        onClear={() => clear(ani.id)}
                    />
                ))
            }
        </div>
    );
}
