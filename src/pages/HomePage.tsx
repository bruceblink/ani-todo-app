import { useEffect, useState } from "react";
import AniList from "@/components/AniList.tsx";
import AniSummary from "@/components/AniSummary.tsx";
import { useAniData } from "@/hooks/useAniData.ts";
import { useFavoriteAni } from "@/hooks/useFavoriteAni.ts";
import type { Ani } from "@/utils/api.ts";
import { fuzzySearch } from "@/utils/utils.ts";
import { CircularProgress } from "@mui/material";

interface HomePageProps {
    searchQuery: string;
}

export default function HomePage({ searchQuery }: HomePageProps) {
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

    useEffect(() => {
        const interval = setInterval(() => refresh?.(), 300_000);
        return () => clearInterval(interval);
    }, [refresh]);

    const handleFilterChange = (filter: 'all' | 'favorites') => {
        setShowFavorite(filter === 'favorites');
    };

    if (loading)
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60vh',
                    gap: 14,
                }}
            >
                <CircularProgress sx={{ color: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    正在加载番剧数据…
                </span>
            </div>
        );

    if (error)
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60vh',
                    gap: 10,
                }}
            >
                <div style={{ fontSize: '2rem' }}>⚠️</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>加载失败</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{error}</div>
            </div>
        );

    if (!Object.keys(data).length)
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60vh',
                    gap: 10,
                }}
            >
                <div style={{ fontSize: '2rem' }}>📭</div>
                <div style={{ color: 'var(--text-secondary)' }}>暂无番剧数据</div>
            </div>
        );

    const today = Object.keys(data)[0];
    const aniList = data[today] as Ani[];
    const filteredAniList = fuzzySearch(aniList, searchQuery, ['title', 'platform']);
    const favoriteList = filteredAniList.filter(ani => favoriteAniItems.has(ani.id));

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                margin: '0 auto',
            }}
        >
            <AniSummary
                weekday={today}
                total={aniList.length}
                onFilterChange={handleFilterChange}
                showFavorite={showFavorite}
            />
            <div
                style={{
                    padding: '0 24px',
                    boxSizing: 'border-box',
                    maxWidth: '960px',
                    margin: '0 auto',
                    width: '100%',
                }}
            >
                <AniList list={showFavorite ? favoriteList : filteredAniList} />
            </div>
        </div>
    );
}
