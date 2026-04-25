import AniFilter from "@/components/AniFilter.tsx";
import AniStat from "@/components/AniStat.tsx";
import { CheckCheck, ArrowUpDown } from "lucide-react";

export type SortBy = 'default' | 'platform' | 'title';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: 'default', label: '时间' },
    { value: 'platform', label: '平台' },
    { value: 'title', label: '标题' },
];

interface Props {
    weekday: string;
    total: number;
    unwatchedCount: number;
    showFavorite: boolean;
    sortBy: SortBy;
    onFilterChange: (filter: 'all' | 'favorites') => void;
    onWatchAll: () => void;
    onSortChange: (sort: SortBy) => void;
}

export default function AniSummary({
    weekday, total, unwatchedCount, showFavorite,
    sortBy, onFilterChange, onWatchAll, onSortChange,
}: Props) {
    return (
        <div
            style={{
                width: '100%',
                maxWidth: '960px',
                margin: '0 auto',
                padding: '14px 24px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                display: 'flex',
                gap: 12,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
            }}
        >
            <AniStat weekday={weekday} total={total} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {/* Sort selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowUpDown size={13} color="var(--text-muted)" />
                    <div
                        style={{
                            display: 'flex',
                            background: 'var(--bg-base)',
                            borderRadius: 8,
                            padding: '2px',
                            border: '1px solid var(--border-color)',
                            gap: 1,
                        }}
                    >
                        {SORT_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onSortChange(opt.value)}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    background: sortBy === opt.value ? 'var(--bg-surface)' : 'transparent',
                                    color: sortBy === opt.value ? 'var(--color-primary-text)' : 'var(--text-muted)',
                                    fontWeight: sortBy === opt.value ? 600 : 400,
                                    fontSize: '0.75rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: sortBy === opt.value ? 'var(--shadow-sm)' : 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Watch-all button */}
                {unwatchedCount > 0 && (
                    <button
                        onClick={onWatchAll}
                        title="将当前列表全部标记为已看"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 12px',
                            borderRadius: 8,
                            background: 'var(--color-success)',
                            color: '#fff',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'opacity 0.15s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                    >
                        <CheckCheck size={13} strokeWidth={2.5} />
                        全部已看
                    </button>
                )}

                <AniFilter showFavorite={showFavorite} onFilterChange={onFilterChange} />
            </div>
        </div>
    );
}
