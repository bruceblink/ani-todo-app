
import { useWatchedAni } from "@/hooks/useWatchedAni.ts";
import { useFavoriteAni } from "@/hooks/useFavoriteAni";

interface Props {
    weekday: string;  // 星期几
    total: number;    // 总数
    showFavorite: boolean;
    onToggleView: (showFavorite: boolean) => void;
}

export default function Header({ weekday, total, showFavorite, onToggleView }: Props) {
    const { watchedAniIds } = useWatchedAni();
    const { favoriteAniIds } = useFavoriteAni();
    const watchedNum = watchedAniIds.size;
    const percentage = total > 0 ? Math.round((watchedNum / total) * 100) : 0;

    return (
        <div className="header" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            borderBottom: '1px solid #eee',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
        }}>
            <div style={{ 
                width: '80%',
                margin: '0 auto',
                padding: '16px 24px 8px',
                boxSizing: 'border-box',
                display: 'flex',
                gap: 24,
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '1.5rem', 
                        fontWeight: 600,
                    }}>
                        今日({weekday})更新番剧 共 {total} 部
                    </h1>
                    <div style={{ marginTop: 8, fontSize: '1rem', color: '#555' }}>
                        已观看 {watchedNum} 部 — {percentage}% 完成
                    </div>
                    <div style={{ width: 200, height: 12, background: '#ddd', borderRadius: 6, overflow: 'hidden', margin: '12px 0 0 0' }}>
                        <div
                            style={{
                                width: `${percentage}%`,
                                height: '100%',
                                background: '#afe1b0',
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
                    onClick={() => onToggleView(false)}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: showFavorite ? '1px solid #ddd' : '2px solid #4f8cff',
                        background: showFavorite ? '#fff' : '#e6f0ff',
                        color: showFavorite ? '#666' : '#1976d2',
                        fontWeight: showFavorite ? 'normal' : '600',
                        cursor: 'pointer',
                        minWidth: 64,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                >主页</button>
                <button
                    onClick={() => onToggleView(true)}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: showFavorite ? '2px solid #ffb300' : '1px solid #ddd',
                        background: showFavorite ? '#fffbe6' : '#fff',
                        color: showFavorite ? '#b26a00' : '#666',
                        fontWeight: showFavorite ? '600' : 'normal',
                        cursor: 'pointer',
                        minWidth: 64,
                        fontSize: '0.9rem',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                >
                    收藏
                    {favoriteAniIds.size > 0 && (
                        <span style={{
                            marginLeft: 4,
                            fontSize: '0.75rem',
                            color: '#ffb300',
                            fontWeight: 'bold',
                        }}>{favoriteAniIds.size}</span>
                    )}</button>
                </div>
            </div>
        </div>
    );
}