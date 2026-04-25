import AniItem from "@/components/AniItem";
import { useWatchedAni } from "@/hooks/useWatchedAni";
import { useFavoriteAni } from "@/hooks/useFavoriteAni";
import type { Ani } from "@/utils/api";

interface Props {
    list: Ani[];
}

export default function AniList({ list }: Props) {
    const { handleWatch, watchedAniIds } = useWatchedAni();
    const { handleFavor, favoriteAniItems } = useFavoriteAni();
    const watchingToday = list.filter(ani => !watchedAniIds.has(ani.id));

    if (watchingToday.length === 0) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '72px 24px',
                    gap: 10,
                }}
            >
                <div style={{ fontSize: '2.5rem' }}>🎉</div>
                <div
                    style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                    }}
                >
                    今天的番剧都看完了！
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    好好休息，明天继续追番
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))',
                gap: '14px',
                padding: '20px 0 32px',
                width: '100%',
            }}
        >
            {watchingToday.map(ani => (
                <div key={ani.id} style={{ height: '140px' }}>
                    <AniItem
                        ani={ani}
                        onClear={handleWatch}
                        isFavorite={favoriteAniItems.has(ani.id)}
                        onToggleFavorite={handleFavor}
                    />
                </div>
            ))}
        </div>
    );
}
