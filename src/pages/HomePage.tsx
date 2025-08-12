import { useEffect, useState } from "react";
import AniList from "@/components/AniList.tsx";
import AniSummary from "@/components/AniSummary.tsx"; // 新增的统计组件
import RefreshButton from "@/components/RefreshButton.tsx";
import { useAniData } from "@/hooks/useAniData.ts";
import { useFavoriteAni } from "@/hooks/useFavoriteAni.ts";
import type { Ani } from "@/utils/api.ts";

export default function HomePage() {
    const { data, loading, error, refresh } = useAniData();
    const { favoriteAniItems, isLoaded } = useFavoriteAni();

    const [showFavorite, setShowFavorite] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (isLoaded && !initialized) {
            setShowFavorite(favoriteAniItems.size > 0);
            setInitialized(true);
        }
    }, [isLoaded, favoriteAniItems, initialized]);
    const handleFilterChange = (filter: 'all' | 'favorites') => {
        setShowFavorite(filter === 'favorites');
    };
    if (loading) return <div className="App">加载中…</div>;
    if (error) return <div className="App">出错了：{error}</div>;
    if (!Object.keys(data).length) return <div className="App">无数据</div>;

    const today = Object.keys(data)[0];
    const aniList = data[today] as Ani[];
    const favoriteList = aniList.filter(ani => favoriteAniItems.has(ani.title));

    return (
        <div className="HomePage-container" style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            margin: '0 auto',
        }}>
            {/* 新的 AniSummary 组件用于显示数据统计 */}
            <AniSummary
                weekday={today}
                total={aniList.length}
                followingCount={favoriteList.length}
                onFilterChange={handleFilterChange}
                showFavorite={showFavorite}
            />
            <RefreshButton loading={loading} onClick={refresh} />
            <div className="App" style={{
                padding: '0 24px',
                boxSizing: 'border-box'
            }}>
                {showFavorite ? (
                    <AniList list={favoriteList} />
                ) : (
                    <AniList list={aniList} />
                )}
            </div>
        </div>
    );
}