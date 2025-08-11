import { Link, useLocation } from 'react-router-dom';
import {useWatchedAni} from "@/hooks/useWatchedAni";

interface Props {
    weekday: string;
    total: number;
    followingCount: number;
}

export default function Header({ weekday, total, followingCount }: Props) {
    const { watchedAniIds } = useWatchedAni();
    const watchedNum = watchedAniIds.size;
    const percentage = total > 0 ? Math.round((watchedNum / total) * 100) : 0;
    const favoritesCount = followingCount > 0 ? followingCount : 0;

    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isFavoritesPage = location.pathname === '/favorites';

    return (
        <div className="header" style={{
            borderBottom: '1px solid var(--header-border-color, #eee)',
            background: 'var(--header-bg-color, rgba(255, 255, 255, 0.95))',
            transition: 'all 0.3s ease',
        }}>
            <div style={{
                width: '100%',
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
                <div style={{
                    display: 'flex',
                    gap: 8,
                    alignSelf: 'flex-start',
                    marginTop: 8,
                    flexShrink: 0
                }}>
                    <Link
                        to="/"
                        style={{
                            padding: '6px 16px',
                            borderRadius: 6,
                            border: isHomePage ? '2px solid var(--primary-color)' : '1px solid var(--button-border-color)',
                            background: isHomePage ? 'var(--primary-light-color)' : 'var(--button-bg-color)',
                            color: isHomePage ? 'var(--primary-dark-color)' : 'var(--text-color)',
                            fontWeight: isHomePage ? '600' : 'normal',
                            cursor: 'pointer',
                            minWidth: 64,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            textDecoration: 'none',
                        }}
                    >主页</Link>
                    <Link
                        to="/favorites"
                        style={{
                            padding: '6px 16px',
                            borderRadius: 6,
                            border: isFavoritesPage ? '2px solid var(--accent-color)' : '1px solid var(--button-border-color)',
                            background: isFavoritesPage ? 'var(--accent-light-color)' : 'var(--button-bg-color)',
                            color: isFavoritesPage ? 'var(--accent-dark-color)' : 'var(--text-color)',
                            fontWeight: isFavoritesPage ? '600' : 'normal',
                            cursor: 'pointer',
                            minWidth: 64,
                            fontSize: '0.9rem',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            textDecoration: 'none',
                        }}
                    >
                        关注
                        {favoritesCount > 0 && (
                            <span style={{
                                marginLeft: 4,
                                fontSize: '0.75rem',
                                color: 'var(--accent-dark-color)',
                                fontWeight: 'bold',
                            }}>{favoritesCount}</span>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    );
}