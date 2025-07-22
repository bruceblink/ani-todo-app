import AniItem, { type Ani } from './AniItem';
import {useWatchedAni} from "@/hooks/useWatchedAni";
import {useFavoriteAni} from "@/hooks/useFavoriteAni";



export default function AniList({ list }: { list: Ani[] }) {
    // —— 已观看番剧 ID 集合 ——
    const {handleWatch, watchedAniIds } = useWatchedAni()
    // —— 收藏番剧相关操作 ——
    const {handleFavor, favoriteAniIds} = useFavoriteAni()


    const watchingToday = list.filter( ani => !watchedAniIds.has(ani.id))
    return (
        <div className="ani-list">
            {
                watchingToday.map(ani => (
                    <AniItem
                        key={ani.id}
                        ani={ani}
                        onClear={handleWatch}
                        isFavorite={favoriteAniIds.has(ani.id)}
                        onToggleFavorite={handleFavor}
                    />
                ))
            }
        </div>
    );
}
