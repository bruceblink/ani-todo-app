import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import AniList from "@/components/AniList.tsx";
import AniSummary from "@/components/AniSummary.tsx";
import WeekNav from "@/components/WeekNav.tsx";
import { useAniData } from "@/hooks/useAniData.ts";
import { useFavoriteAni } from "@/hooks/useFavoriteAni.ts";
import type { Ani } from "@/utils/api.ts";
import { fuzzySearch } from "@/utils/utils.ts";
import { getTodayDateStr, getTodayWeekdayLabel, type WeekDay } from "@/utils/weekUtils.ts";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";

interface HomePageProps {
    searchQuery: string;
}

export default function HomePage({ searchQuery }: HomePageProps) {
    const [selectedDay, setSelectedDay] = useState<WeekDay>(() => ({
        dateStr: getTodayDateStr(),
        weekdayLabel: getTodayWeekdayLabel(),
        isToday: true,
        dayOfMonth: new Date().getDate(),
    }));

    const { data, loading, error, refresh } = useAniData({
        dateStr: selectedDay.dateStr,
        weekdayLabel: selectedDay.weekdayLabel,
    });
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

    // Listen for tray refresh event
    useEffect(() => {
        let unlisten: (() => void) | undefined;
        listen('tray:refresh', () => {
            void refresh();
        }).then(fn => { unlisten = fn; });
        return () => unlisten?.();
    }, [refresh]);

    const handleFilterChange = (filter: 'all' | 'favorites') => {
        setShowFavorite(filter === 'favorites');
    };

    const handleDaySelect = (day: WeekDay) => {
        setSelectedDay(day);
        setShowFavorite(false);
    };

    if (loading)
        return (
            <>
                <WeekNav selectedDate={selectedDay.dateStr} onSelect={handleDaySelect} />
                <div className="page-state">
                    <Loader2
                        size={32}
                        strokeWidth={2}
                        style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }}
                    />
                    <p className="page-state__desc">正在加载番剧数据…</p>
                </div>
            </>
        );

    if (error)
        return (
            <>
                <WeekNav selectedDate={selectedDay.dateStr} onSelect={handleDaySelect} />
                <div className="page-state">
                    <AlertTriangle size={36} strokeWidth={1.5} color="var(--color-error)" />
                    <p className="page-state__title">加载失败</p>
                    <p className="page-state__desc">{error}</p>
                </div>
            </>
        );

    if (!Object.keys(data).length)
        return (
            <>
                <WeekNav selectedDate={selectedDay.dateStr} onSelect={handleDaySelect} />
                <div className="page-state">
                    <Inbox size={36} strokeWidth={1.5} color="var(--text-muted)" />
                    <p className="page-state__title">暂无番剧数据</p>
                    <p className="page-state__desc">
                        {selectedDay.isToday ? '请检查网络连接或稍后重试' : '该日期暂无更新记录'}
                    </p>
                </div>
            </>
        );

    const weekdayKey = Object.keys(data)[0];
    const aniList = data[weekdayKey] as Ani[];
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
            <WeekNav selectedDate={selectedDay.dateStr} onSelect={handleDaySelect} />
            <AniSummary
                weekday={weekdayKey}
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
