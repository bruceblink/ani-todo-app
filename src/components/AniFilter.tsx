
interface Props {
    followingCount: number;
    showFavorite: boolean;
    onFilterChange: (filter: 'all' | 'favorites') => void;
}

export default function AniFilter({followingCount, showFavorite, onFilterChange }: Props) {
    const favoritesCount = followingCount > 0 ? followingCount : 0;

    return (
            <>
                <div style={{
                    display: 'flex',
                    gap: 8,
                    alignSelf: 'flex-start',
                    marginTop: 8,
                    flexShrink: 0
                }}>
                    <button
                        onClick={() => onFilterChange('all')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 6,
                            background: showFavorite ? '#fff' : 'var(--primary-light-color)',
                            color: showFavorite ? '#666' : 'var(--link-color)',
                            fontWeight: showFavorite ? 'normal' : '600',
                            minWidth: 64,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                        }}
                    >
                        全部番剧
                    </button>
                    <button
                        onClick={() => onFilterChange('favorites')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 6,
                            background: showFavorite ? 'var(--accent-light-color)' : '#fff',
                            color: showFavorite ? 'var(--link-color)' : '#666',
                            fontWeight: showFavorite ? '600' : 'normal',
                            minWidth: 64,
                            fontSize: '0.9rem',
                            position: 'relative', // 新增：设置相对定位
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                        }}
                    >
                        关注列表
                        {favoritesCount > 0 && (
                            <span style={{
                                // 新增：绝对定位，使其不影响父元素的宽度
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                padding: '2px 6px',
                                borderRadius: '9999px',
                                backgroundColor: '#ffb300',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            }}>{favoritesCount}</span>
                        )}
                    </button>
                </div>
            </>
    )
}