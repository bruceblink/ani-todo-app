import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { toast } from "react-hot-toast";
import AniList from "@/components/AniList.tsx";
import AniSummary, { type SortBy } from "@/components/AniSummary.tsx";
import WeekNav from "@/components/WeekNav.tsx";
import { useAniData } from "@/hooks/useAniData.ts";
import { useFavoriteAni } from "@/hooks/useFavoriteAni.ts";
import { useWatchedAni } from "@/hooks/useWatchedAni.ts";
import type { Ani } from "@/utils/api.ts";
import { fuzzySearch } from "@/utils/utils.ts";
import { getTodayDateStr, getTodayWeekdayLabel, type WeekDay } from "@/utils/weekUtils.ts";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";

interface HomePageProps {
    searchQuery: string;
    viewMode: "grid" | "list";
}

function sortList(list: Ani[], sortBy: SortBy): Ani[] {
    if (sortBy === "platform") return [...list].sort((a, b) => a.platform.localeCompare(b.platform, "zh"));
    if (sortBy === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title, "zh"));
    return list;
}

export default function HomePage({ searchQuery, viewMode }: HomePageProps) {
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
    const { watchedAniIds, handleWatchAll } = useWatchedAni();

    const [showFavorite, setShowFavorite] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [sortBy, setSortBy] = useState<SortBy>("default");

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

    useEffect(() => {
        let unlisten: (() => void) | undefined;
        listen("tray:refresh", () => {
            void refresh();
        }).then((fn) => {
            unlisten = fn;
        });
        return () => unlisten?.();
    }, [refresh]);

    const handleFilterChange = (filter: "all" | "favorites") => setShowFavorite(filter === "favorites");
    const handleDaySelect = (day: WeekDay) => {
        setSelectedDay(day);
        setShowFavorite(false);
    };

    const hasData = Object.keys(data).length > 0;
    const isInitialLoading = loading && !hasData && !error;
    const isRefreshing = loading && hasData;

    if (isInitialLoading)
        return (
            <div className="home-overview" style={{ gap: 0 }}>
                <WeekNav selectedDate={selectedDay.dateStr} onSelect={handleDaySelect} />
                <div className="overview-toolbar overview-toolbar--loading" aria-hidden>
                    <div className="overview-toolbar-loading-pill" />
                    <div className="overview-toolbar-loading-actions">
                        <div className="overview-toolbar-loading-btn" />
                        <div className="overview-toolbar-loading-btn" />
                    </div>
                </div>
                <div className="home-overview-content">
                    <div className={`ani-loading-grid ani-loading-grid--${viewMode}`}>
                        {Array.from({ length: viewMode === "grid" ? 8 : 6 }).map((_, index) => (
                            <div key={index} className={`ani-loading-card ani-loading-card--${viewMode}`} />
                        ))}
                    </div>
                    <div className="page-state page-state--inline">
                        <Loader2 size={18} strokeWidth={2} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
                        <p className="page-state__desc">正在加载番剧数据…</p>
                    </div>
                </div>
            </div>
        );

    if (error && !hasData)
        return (
            <div className="home-overview">
                <WeekNav selectedDate={selectedDay.dateStr} onSelect={handleDaySelect} />
                <div className="home-overview-content">
                    <div className="page-state">
                        <AlertTriangle size={36} strokeWidth={1.5} color="var(--color-error)" />
                        <p className="page-state__title">加载失败</p>
                        <p className="page-state__desc">{error}</p>
                    </div>
                </div>
            </div>
        );

    if (!hasData)
        return (
            <div className="home-overview">
                <WeekNav selectedDate={selectedDay.dateStr} onSelect={handleDaySelect} />
                <div className="home-overview-content">
                    <div className="page-state">
                        <Inbox size={36} strokeWidth={1.5} color="var(--text-muted)" />
                        <p className="page-state__title">暂无番剧数据</p>
                        <p className="page-state__desc">
                            {selectedDay.isToday ? "请检查网络连接或稍后重试" : "该日期暂无更新记录"}
                        </p>
                    </div>
                </div>
            </div>
        );

    const weekdayKey = Object.keys(data)[0];
    const aniList = data[weekdayKey] as Ani[];
    const filtered = fuzzySearch(aniList, searchQuery, ["title", "platform"]);
    const displayList = sortList(showFavorite ? filtered.filter((a) => favoriteAniItems.has(a.id)) : filtered, sortBy);
    const unwatchedCount = displayList.filter((a) => !watchedAniIds.has(a.id)).length;

    const handleWatchAllClick = async () => {
        const items = displayList.filter((a) => !watchedAniIds.has(a.id));
        await handleWatchAll(items);
        toast.success(`已标记 ${items.length} 部番剧为已看`);
    };

    return (
        <div className="home-overview" style={{ gap: 0 }}>
            <WeekNav selectedDate={selectedDay.dateStr} onSelect={handleDaySelect} />
            <AniSummary
                weekday={weekdayKey}
                total={aniList.length}
                unwatchedCount={unwatchedCount}
                showFavorite={showFavorite}
                sortBy={sortBy}
                onFilterChange={handleFilterChange}
                onWatchAll={handleWatchAllClick}
                onSortChange={setSortBy}
            />
            <div className="home-overview-content home-overview-content--with-refresh">
                {isRefreshing && (
                    <div className="overview-refreshing-overlay" role="status" aria-live="polite">
                        <Loader2 size={14} strokeWidth={2} className="spin" />
                        <span>更新中…</span>
                    </div>
                )}
                <AniList list={displayList} layoutMode={viewMode} />
            </div>
        </div>
    );
}
