import AniFilter from "@/components/AniFilter.tsx";
import AniStat from "@/components/AniStat.tsx";
import { CheckCheck, ArrowUpDown } from "lucide-react";

export type SortBy = "default" | "platform" | "title";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: "default", label: "时间" },
    { value: "platform", label: "平台" },
    { value: "title", label: "标题" },
];

interface Props {
    weekday: string;
    total: number;
    unwatchedCount: number;
    showFavorite: boolean;
    sortBy: SortBy;
    onFilterChange: (filter: "all" | "favorites") => void;
    onWatchAll: () => void;
    onSortChange: (sort: SortBy) => void;
}

export default function AniSummary({
    weekday,
    total,
    unwatchedCount,
    showFavorite,
    sortBy,
    onFilterChange,
    onWatchAll,
    onSortChange,
}: Props) {
    return (
        <div className="overview-toolbar-wrap">
            <div className="overview-toolbar">
                <AniStat weekday={weekday} total={total} />

                <div className="overview-toolbar-actions">
                    <div className="overview-sort-wrap">
                        <ArrowUpDown size={13} color="var(--text-muted)" />
                        <div className="overview-segmented">
                            {SORT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => onSortChange(opt.value)}
                                    className={`overview-segmented-btn${sortBy === opt.value ? " is-active" : ""}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {unwatchedCount > 0 && (
                        <button
                            type="button"
                            onClick={onWatchAll}
                            title="将当前列表全部标记为已看"
                            className="overview-watch-all-btn"
                        >
                            <CheckCheck size={13} strokeWidth={2.5} />
                            全部已看
                        </button>
                    )}

                    <AniFilter showFavorite={showFavorite} onFilterChange={onFilterChange} />
                </div>
            </div>
        </div>
    );
}
