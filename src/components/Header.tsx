import { Link, useLocation } from 'react-router-dom';

export default function Header() {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isFavoritesPage = location.pathname === '/favorites';
    const isAboutPage = location.pathname === '/about';

    return (
        <nav className="header" style={{
            // 重新添加固定定位样式
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            borderBottom: '1px solid var(--header-border-color, #eee)',
            background: 'var(--header-bg-color, rgba(255, 255, 255, 0.95))',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            height: '80px', // 设置一个固定高度
        }}>
            <div style={{
                width: '100%',
                margin: '0 auto',
                padding: '16px 24px',
                boxSizing: 'border-box',
                display: 'flex',
                gap: 24,
                justifyContent: 'center',
                alignItems: 'center',
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
                    历史
                </Link>
                <Link
                    to="/about"
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: isAboutPage ? '2px solid var(--accent-color)' : '1px solid var(--button-border-color)',
                        background: isAboutPage ? 'var(--accent-light-color)' : 'var(--button-bg-color)',
                        color: isAboutPage ? 'var(--accent-dark-color)' : 'var(--text-color)',
                        fontWeight: isAboutPage ? '600' : 'normal',
                        cursor: 'pointer',
                        minWidth: 64,
                        fontSize: '0.9rem',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        textDecoration: 'none',
                    }}
                >
                    关于
                </Link>
            </div>
        </nav>
    );
}