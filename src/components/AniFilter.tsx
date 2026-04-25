import { useFavoriteAni } from "@/hooks/useFavoriteAni.ts";

interface Props {
    showFavorite: boolean;
    onFilterChange: (filter: 'all' | 'favorites') => void;
}

export default function AniFilter({ showFavorite, onFilterChange }: Props) {
    const { favoriteAniItems } = useFavoriteAni();
    const favoritesCount = favoriteAniItems.size;

    return (
        <div
            style={{
                display: 'flex',
                background: 'var(--bg-base)',
                borderRadius: 10,
                padding: '3px',
                gap: 2,
                border: '1px solid var(--border-color)',
                flexShrink: 0,
            }}
        >
            <button
                onClick={() => onFilterChange('all')}
                style={{
                    padding: '5px 14px',
                    borderRadius: 7,
                    background: !showFavorite ? 'var(--bg-surface)' : 'transparent',
                    color: !showFavorite ? 'var(--color-primary-text)' : 'var(--text-secondary)',
                    fontWeight: !showFavorite ? 600 : 400,
                    fontSize: '0.82rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: !showFavorite ? 'var(--shadow-sm)' : 'none',
                    whiteSpace: 'nowrap',
                }}
            >
                全部
            </button>
            <button
                onClick={() => onFilterChange('favorites')}
                style={{
                    padding: '5px 14px',
                    borderRadius: 7,
                    background: showFavorite ? 'var(--bg-surface)' : 'transparent',
                    color: showFavorite ? '#d97706' : 'var(--text-secondary)',
                    fontWeight: showFavorite ? 600 : 400,
                    fontSize: '0.82rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: showFavorite ? 'var(--shadow-sm)' : 'none',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                }}
            >
                关注
                {favoritesCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            minWidth: 17,
                            height: 17,
                            padding: '0 4px',
                            borderRadius: 9999,
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                        }}
                    >
                        {favoritesCount}
                    </span>
                )}
            </button>
        </div>
    );
}
