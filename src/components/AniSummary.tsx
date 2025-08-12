// AniSummary.tsx
import { useWatchedAni } from "@/hooks/useWatchedAni";

interface Props {
    weekday: string;
    total: number;
    followingCount: number;
    showFavorite: boolean;
    onFilterChange: (filter: 'all' | 'favorites') => void;
}

export default function AniSummary({ weekday, total, followingCount, showFavorite, onFilterChange }: Props) {
    const { watchedAniIds } = useWatchedAni();
    const watchedNum = watchedAniIds.size;
    const percentage = total > 0 ? Math.round((watchedNum / total) * 100) : 0;
    const favoritesCount = followingCount > 0 ? followingCount : 0;

    return (
        <div className="ani-summary" style={{
            width: '640px',
            margin: '0 auto',
            padding: '16px 24px 8px',
            borderBottom: '1px solid var(--header-border-color, #eee)',
            background: 'var(--header-bg-color, rgba(255, 255, 255, 0.95))',
            transition: 'all 0.3s ease',
            display: 'flex',
            gap: 24,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
        }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'var(--text-color, #333)'
                }}>
                    今日({weekday})更新番剧 共 {total} 部
                </h1>
                <div style={{ marginTop: 8, fontSize: '1rem', color: 'var(--sub-text-color, #555)' }}>
                    已观看 {watchedNum} 部 — {percentage}% 完成
                </div>
                <div style={{ width: 200, height: 12, background: 'var(--progress-bg, #ddd)', borderRadius: 6, overflow: 'hidden', margin: '12px 0 0 0' }}>
                    <div
                        style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'var(--progress-fill, #afe1b0)',
                            transition: 'width 0.3s ease',
                        }}
                    />
                </div>
            </div>

            {/* 按钮组 */}
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
        </div>
    );
}