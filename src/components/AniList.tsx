import AniItem, { type Ani } from './AniItem';

type Props = {
    list: Ani[];
    clearedIds: Set<string>;
    onClear: (id: string) => void;
};

export default function AniList({ list, clearedIds, onClear }: Props) {
    return (
        <div className="ani-list">
            {list.filter(a => !clearedIds.has(a.detail_url)).map(ani => (
                <AniItem key={ani.detail_url} ani={ani} onClear={() => onClear(ani.detail_url)} />
            ))}
        </div>
    );
}
