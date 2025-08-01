import AniItem from "@/components/AniItem";
import { useWatchedAni } from "@/hooks/useWatchedAni";
import { useFavoriteAni } from "@/hooks/useFavoriteAni";
import type { Ani } from "@/utils/api";

interface Props {
    list: Ani[];
}

export default function AniList({ list }: Props) {
    // —— 已观看番剧 ID 集合 ——
    const { handleWatch, watchedAniIds } = useWatchedAni();
    // —— 收藏番剧相关操作 ——
    const { handleFavor, favoriteAniItems } = useFavoriteAni();
    // —— 过滤出今天还没看的番剧列表 ——
    const watchingToday = list.filter(ani => !watchedAniIds.has(ani.id));
    return (
        <div className="ani-list" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'min(24px, 2vw)',
            justifyContent: 'center',
            padding: '120px 0 24px',
            margin: '0 auto',
            width: '100%',
            maxWidth: '90%'
        }}>
            {
                watchingToday.map(ani => (
                    <div key={ani.id} style={{
                        width: 'calc(clamp(480px, calc(90vw/4 - 24px), 360px) * 0.8)',   // 缩小宽度为原来的80%
                        height: 'calc(calc(clamp(480px, calc(90vw/4 - 24px), 360px) * 0.618) * 0.8)',  // 缩小高度为原来的80%
                        flexShrink: 0,
                    }}>
                        <AniItem
                            ani={ani}
                            onClear={handleWatch}
                            isFavorite={favoriteAniItems.has(ani.title)}
                            onToggleFavorite={handleFavor}
                        />
                    </div>
                   )
                )
            }
        </div>
    );
}
