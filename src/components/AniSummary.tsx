import AniFilter from "@/components/AniFilter.tsx";
import AniStat from "@/components/AniStat.tsx";
import {useFavoriteAni} from "@/hooks/useFavoriteAni.ts";

interface Props {
    weekday: string;
    total: number;
    showFavorite: boolean;
    onFilterChange: (filter: 'all' | 'favorites') => void;
}

export default function AniSummary({ weekday, total, showFavorite, onFilterChange }: Props) {

    // —— 收藏番剧相关操作 ——
    const { favoriteAniItems } = useFavoriteAni();

    return (
        <div className="ani-summary" style={{
            width: '640px',
            margin: '0 auto',
            padding: '16px 24px 8px',
            borderBottom: '1px solid var(--header-border-color, #eee)',
            background: 'var(--header-bg-color, rgba(255, 255, 255, 0.95))',
            transition: 'all 0.3s ease',
            display: 'flex',
            gap: 24,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            }}>
            <AniStat weekday={weekday} total={total}/>

            <AniFilter
                followingCount={favoriteAniItems.size}
                showFavorite={showFavorite}
                onFilterChange={onFilterChange}
            />
        </div>
    );
}