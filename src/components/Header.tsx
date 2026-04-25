import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Tv, Menu, X } from "lucide-react";
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

    const navItems = [
        { to: "/", label: "今日更新", active: isHomePage },
        { to: "/favorites", label: "观看历史", active: isFavoritesPage },
        { to: "/about", label: "关于", active: isAboutPage },
    ];

    return (
        <>
            <nav
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0,
                    zIndex: 100,
                    borderBottom: '1px solid var(--header-border)',
                    background: 'var(--header-bg)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    boxSizing: 'border-box',
                    justifyContent: 'space-between',
                    gap: '16px',
                }}
            >
                {/* Logo */}
                <Link
                    to="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textDecoration: 'none',
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
                        }}
                    >
                        <Tv size={18} color="#fff" strokeWidth={2} />
                    </div>
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        AniTodo
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div
                    className="nav-links"
                    style={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                    {navItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                padding: '6px 14px',
                                borderRadius: 8,
                                background: item.active ? 'var(--color-primary-light)' : 'transparent',
                                color: item.active ? 'var(--color-primary-text)' : 'var(--text-secondary)',
                                fontWeight: item.active ? 600 : 400,
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right: Search + Hamburger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AniSearch
                        onSearch={onSearchChange}
                        debounceMs={300}
                        persistKey="aniSearch.v1"
                        clearOnBlur={false}
                    />
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="hamburger-btn"
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        aria-label="Toggle menu"
                        type="button"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: '64px',
                        left: 0, right: 0,
                        backgroundColor: 'var(--bg-surface)',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '8px 12px 12px',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 99,
                    }}
                >
                    {navItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={handleLinkClick}
                            style={{
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: item.active ? 'var(--color-primary-light)' : 'transparent',
                                color: item.active ? 'var(--color-primary-text)' : 'var(--text-primary)',
                                fontWeight: item.active ? 600 : 400,
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                marginBottom: 2,
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}

            <style>{`
                @media (max-width: 600px) {
                    .nav-links { display: none !important; }
                    .hamburger-btn { display: flex !important; }
                }
            `}</style>
        </>
    );
}
