import { useEffect, useState } from "react";
import AniList from "@/components/AniList";
import Header from "@/components/Header";
import RefreshButton from "@/components/RefreshButton";
import { useAniData } from "@/hooks/useAniData";
import { useFavoriteAni } from "@/hooks/useFavoriteAni";
import type { Ani } from "@/utils/api";

export default function HomePage() {
    const { data, loading, error, refresh } = useAniData();
    const { favoriteAniItems, isLoaded } = useFavoriteAni();

    const [showFavorite, setShowFavorite] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // 首次加载时，如果收藏列表有内容，则显示收藏列表，否则显示全部番剧列表
    useEffect(() => {
        if (isLoaded && !initialized) {
            setShowFavorite(favoriteAniItems.size > 0);
            setInitialized(true);
        }
    }, [isLoaded, favoriteAniItems, initialized]);

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
            <Header
                weekday={today}
                total={aniList.length}
                followingCount={favoriteList.length}
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