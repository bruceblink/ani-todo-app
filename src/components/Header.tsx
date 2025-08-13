import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AniSearch from "@/components/AniSearch.tsx";


interface HeaderProps {
    onSearchChange: (value: string) => void;
}

export default function Header({ onSearchChange }: HeaderProps) {
    const location = useLocation();
    const isHomePage = location.pathname === "/";
    const isFavoritesPage = location.pathname === "/favorites";
    const isAboutPage = location.pathname === "/about";

    const [menuOpen, setMenuOpen] = useState(false);

    const handleLinkClick = () => setMenuOpen(false);

    const handleSearch = (value: string) => {
        onSearchChange(value);
    };

    return (
        <>
            <nav
                className="header"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    borderBottom: '1px solid var(--header-border-color, #eee)',
                    background: 'var(--header-bg-color, rgba(255, 255, 255, 0.95))',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s ease',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    boxSizing: 'border-box',
                    justifyContent: "space-between", // 左右两边分开
                    gap: "16px",
                }}
            >
                {/* 汉堡按钮 */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 8,
                        borderRadius: 4,
                    }}
                    aria-label="Toggle menu"
                    className="hamburger-btn"
                    type="button"
                >
                    <div
                        style={{
                            width: 24,
                            height: 2,
                            backgroundColor: '#333',
                            marginBottom: 5,
                            borderRadius: 1,
                        }}
                    />
                    <div
                        style={{
                            width: 24,
                            height: 2,
                            backgroundColor: '#333',
                            marginBottom: 5,
                            borderRadius: 1,
                        }}
                    />
                    <div
                        style={{
                            width: 24,
                            height: 2,
                            backgroundColor: '#333',
                            borderRadius: 1,
                        }}
                    />
                </button>

                {/* 左侧菜单组 */}
                <div
                    className="nav-links"
                    style={{
                        display: 'flex',
                        alignItems: "center",
                    }}
                >
                    <Link
                        to="/"
                        onClick={handleLinkClick}
                        style={linkStyle(isHomePage, 'accent')}
                    >
                        今日更新
                    </Link>
                    <Link
                        to="/favorites"
                        onClick={handleLinkClick}
                        style={linkStyle(isFavoritesPage, 'accent')}
                    >
                        历史数据
                    </Link>
                    <Link
                        to="/about"
                        onClick={handleLinkClick}
                        style={linkStyle(isAboutPage, 'accent')}
                    >
                        关于
                    </Link>
                </div>

                {/* 右侧搜索 — 始终显示 */}
                <div
                    className="search-container"
                    style={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <AniSearch onSearch={handleSearch} />
                </div>
            </nav>

            {/* 移动端弹出菜单 */}
            {menuOpen && (
                <div
                    className="mobile-menu"
                    style={{
                        position: 'fixed',
                        top: '80px',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--header-bg-color, #fff)',
                        borderBottom: '1px solid var(--header-border-color, #eee)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        padding: 16,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 99,
                    }}
                >
                    {/* 移动端弹出菜单只显示菜单项，不显示搜索 */}
                    <Link
                        to="/"
                        onClick={handleLinkClick}
                        style={linkStyle(isHomePage, 'primary')}
                    >
                        主页
                    </Link>
                    <Link
                        to="/favorites"
                        onClick={handleLinkClick}
                        style={linkStyle(isFavoritesPage, 'accent')}
                    >
                        历史
                    </Link>
                    <Link
                        to="/about"
                        onClick={handleLinkClick}
                        style={linkStyle(isAboutPage, 'accent')}
                    >
                        关于
                    </Link>
                </div>
            )}

            {/* 媒体查询：控制汉堡按钮和菜单显示，搜索容器始终显示 */}
            <style>{`
                @media (max-width: 768px) {
                  .nav-links {
                    display: none !important;   /* 隐藏菜单项 */
                  }
                  .hamburger-btn {
                    display: block !important;  /* 显示汉堡按钮 */
                  }
                  /* 搜索容器不隐藏 */
                }
          `}</style>
        </>
    );
}

type ColorType = 'primary' | 'accent' | 'default';

function linkStyle(isActive: boolean, colorType: ColorType) {
    const colors = {
        primary: {
            border: '2px solid var(--primary-color)',
            background: 'var(--primary-light-color)',
            color: 'var(--primary-dark-color)',
        },
        accent: {
            border: '2px solid var(--accent-color)',
            background: 'var(--accent-light-color)',
            color: 'var(--link-color)',
        },
        default: {
            border: '1px solid var(--button-border-color)',
            background: 'var(--button-bg-color)',
            color: 'var(--text-color)',
        },
    };

    const activeColors = colors[colorType] || colors.default;

    return {
        padding: '6px 16px',
        borderRadius: 6,
        background: isActive ? activeColors.background : colors.default.background,
        color: isActive ? activeColors.color : colors.default.color,
        fontWeight: isActive ? '600' : 'normal',
        cursor: 'pointer',
        minWidth: 64,
        fontSize: '0.9rem',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
    };
}