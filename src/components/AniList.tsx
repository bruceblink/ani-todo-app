import AniItem from "@/components/AniItem";
import { useWatchedAni } from "@/hooks/useWatchedAni";
import { useFavoriteAni } from "@/hooks/useFavoriteAni";
import type { Ani } from "@/utils/api";

interface Props {
    list: Ani[];
    layoutMode: "grid" | "list";
}

export default function AniList({ list, layoutMode }: Props) {
    const { handleWatch, watchedAniIds } = useWatchedAni();
    const { handleFavor, favoriteAniItems } = useFavoriteAni();
    const watchingToday = list.filter((ani) => !watchedAniIds.has(ani.id));

    if (watchingToday.length === 0) {
        return (
            <div className="ani-empty-state">
                <div className="ani-empty-state-icon">🎉</div>
                <div className="ani-empty-state-title">今天的番剧都看完了！</div>
                <div className="ani-empty-state-desc">好好休息，明天继续追番</div>
            </div>
        );
    }

    return (
        <div className={`ani-list ani-list--${layoutMode}`}>
            {watchingToday.map((ani, index) => (
                <div
                    key={ani.id}
                    className="ani-list-item"
                    style={{ animationDelay: `${index * 0.04}s` }}
                >
                    <AniItem
                        ani={ani}
                        variant={layoutMode}
                        onClear={handleWatch}
                        isFavorite={favoriteAniItems.has(ani.id)}
                        onToggleFavorite={handleFavor}
                    />
                </div>
            ))}
        </div>
    );
}
