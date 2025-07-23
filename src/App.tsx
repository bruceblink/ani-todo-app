import AniList from "@/components/AniList";
import Header from "@/components/Header";
import RefreshButton from "@/components/RefreshButton";
import { useAniData } from "@/hooks/useAniData";
import { useFavoriteAni } from "@/hooks/useFavoriteAni";
import type { Ani } from "@/utils/api";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function App() {
    const { data, loading, error, refresh } = useAniData();
    const { favoriteAniIds } = useFavoriteAni();
    // 初始化时根据收藏内容决定默认界面
    const [showFavorite, setShowFavorite] = useState(() => favoriteAniIds.size > 0);

    if (loading)   return <div className="App">加载中…</div>;
    if (error)     return <div className="App">出错了：{error}</div>;
    if (!Object.keys(data).length) return <div className="App">无数据</div>;

    const today = Object.keys(data)[0];
    const aniList = data[today] as Ani[];
    // 收藏列表
    const favoriteList = aniList.filter(ani => favoriteAniIds.has(ani.id));

    // 不再自动切换，避免hooks顺序问题，仅首次渲染时决定默认界面

    return (
        <>
            {/* 显示标题和总数和已观看数目，并添加切换按钮 */}
            <Header
                weekday={today}
                total={aniList.length}
                showFavorite={showFavorite}
                onToggleView={setShowFavorite}
            />
            {/* 固定在右上角的刷新按钮 */}
            <RefreshButton loading={loading} onClick={refresh} />
            <div className="App" style={{
                width: '100%',
                margin: '0 auto',
                padding: '0 24px',
                boxSizing: 'border-box'
            }}>
                {/* 番剧列表或收藏列表 */}
                {showFavorite ? (
                    <AniList list={favoriteList} />
                ) : (
                    <AniList list={aniList} />
                )}
            </div>
            <Toaster
                position="top-center"
                toastOptions={{
                    className:
                        'bg-gray-50 dark:bg-slate-600 dark:text-white rounded-md shadow-md',
                }}
            />
        </>
    );
}
