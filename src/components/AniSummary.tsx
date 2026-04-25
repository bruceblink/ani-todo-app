import AniFilter from "@/components/AniFilter.tsx";
import AniStat from "@/components/AniStat.tsx";

interface Props {
    weekday: string;
    total: number;
    showFavorite: boolean;
    onFilterChange: (filter: 'all' | 'favorites') => void;
}

export default function AniSummary({ weekday, total, showFavorite, onFilterChange }: Props) {
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
                gap: 16,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
            }}
        >
            <AniStat weekday={weekday} total={total} />
            <AniFilter showFavorite={showFavorite} onFilterChange={onFilterChange} />
        </div>
    );
}
