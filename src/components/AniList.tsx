import AniItem, { type Ani } from './AniItem';
import {getAniId} from "../utils/utils.ts";

type Props = {
    list: Ani[];
    clearedIds: Set<string>;
    onClear: (id: string) => void;
};

export default function AniList({ list, clearedIds, onClear }: Props) {
    return (
        <div className="ani-list">
            {
                list.filter(ani => !clearedIds.has(getAniId(ani)))
                  .map(ani => (
                     <AniItem key={getAniId(ani)} ani={ani} onClear={() => onClear(getAniId(ani))} />
                    )
                  )
            }
        </div>
    );
}
