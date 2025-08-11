// 动漫数据更新统计

import {useWatchedAni} from "@/hooks/useWatchedAni";

interface Props {
    weekday: string;  // 星期几
    total: number;    // 动漫更新总数
    followingCount: number; // 关注的动漫数量，可选
}

export default function AnimeDataSummary({ weekday, total, followingCount }: Props) {
    const { watchedAniIds } = useWatchedAni();
    const watchedNum = watchedAniIds.size;
    const percentage = total > 0 ? Math.round((watchedNum / total) * 100) : 0;
    const favoritesCount = followingCount > 0 ? followingCount : 0;

    return (
        <div className="ani-summary" style={{
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
                {/* 这里可以放一些页面内部的筛选按钮，比如切换“全部”和“关注” */}
                <button
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        background: '#fff',
                        color: '#666',
                        minWidth: 64,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                    }}
                >
                    全部番剧
                </button>
                <button
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        background: '#fff',
                        color: '#666',
                        minWidth: 64,
                        fontSize: '0.9rem',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                    }}
                >
                    关注列表
                    {favoritesCount > 0 && (
                        <span style={{
                            marginLeft: 4,
                            fontSize: '0.75rem',
                            color: '#ffb300',
                            fontWeight: 'bold',
                        }}>{favoritesCount}</span>
                    )}
                </button>
            </div>
        </div>
    );
}