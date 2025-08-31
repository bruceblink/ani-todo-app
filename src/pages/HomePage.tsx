import {useEffect, useState} from "react";
import AniList from "@/components/AniList.tsx";
import AniSummary from "@/components/AniSummary.tsx"; // 新增的统计组件
import {useAniData} from "@/hooks/useAniData.ts";
import {useFavoriteAni} from "@/hooks/useFavoriteAni.ts";
import type {Ani} from "@/utils/api.ts";
import {fuzzySearch} from "@/utils/utils.ts";

interface HomePageProps {
    searchQuery: string;
}

export default function HomePage({ searchQuery }: HomePageProps) {
    const { data, loading, error, refresh} = useAniData();
    const { favoriteAniItems, isLoaded } = useFavoriteAni();

    const [showFavorite, setShowFavorite] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (isLoaded && !initialized) {
            setShowFavorite(favoriteAniItems.size > 0);
            setInitialized(true);
        }
    }, [isLoaded, favoriteAniItems, initialized]);

    // ⭐ 定时刷新逻辑（比如 5分钟一次）
    useEffect(() => {
        const interval = setInterval(() => {
            refresh?.(); // 调用 hook 提供的刷新函数
        }, 300 * 1000);

        return () => clearInterval(interval); // 卸载时清理
    }, [refresh]);
    const handleFilterChange = (filter: 'all' | 'favorites') => {
        setShowFavorite(filter === 'favorites');
    };
    if (loading) return <div className="loading">加载中…</div>;
    if (error) return <div className="loading">出错了：{error}</div>;
    if (!Object.keys(data).length) return <div className="loading">无数据</div>;

    const today = Object.keys(data)[0];
    const aniList = data[today] as Ani[];
    const filteredAniList = fuzzySearch(aniList, searchQuery, ['title', 'platform'])
    const favoriteList = filteredAniList.filter(ani => favoriteAniItems.has(ani.id)); // 过滤出收藏的动画并匹配搜索查询

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
                onFilterChange={handleFilterChange}
                showFavorite={showFavorite}
            />
            {/*<RefreshButton loading={loading} onClick={refresh} />*/}
            <div className="App" style={{
                padding: '0 24px',
                boxSizing: 'border-box'
            }}>
                {showFavorite ? (
                    <AniList list={favoriteList} />
                ) : (
                    <AniList list={filteredAniList} />
                )}
            </div>
        </div>
    );
}