import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Tv,
    Menu,
    X,
    CalendarDays,
    History,
    Settings,
    CircleHelp,
    Grid3X3,
    List,
} from "lucide-react";
import AniSearch from "@/components/AniSearch.tsx";

interface HeaderProps {
    onSearchChange: (value: string) => void;
    viewMode: "grid" | "list";
    onViewModeChange: (mode: "grid" | "list") => void;
}

export default function Header({ onSearchChange, viewMode, onViewModeChange }: HeaderProps) {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const navItems = useMemo(
        () => [
            { to: "/", label: "今日更新", icon: CalendarDays },
            { to: "/favorites", label: "观看历史", icon: History },
            { to: "/settings", label: "设置", icon: Settings },
            { to: "/about", label: "关于", icon: CircleHelp },
        ],
        []
    );

    const showViewToggle = location.pathname === "/";

    return (
        <>
            <aside className="console-sidebar">
                <Link to="/" className="console-brand">
                    <div className="console-brand-logo">
                        <Tv size={17} color="#fff" strokeWidth={2.2} />
                    </div>
                    <span className="console-brand-text">FanJi</span>
                </Link>

                <nav className="console-nav">
                    {navItems.map((item) => {
                        const active = location.pathname === item.to;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`console-nav-link${active ? " is-active" : ""}`}
                            >
                                <Icon size={16} strokeWidth={2} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <header className="console-topbar">
                <div className="console-topbar-right">
                    {showViewToggle && (
                        <div className="console-view-toggle" role="group" aria-label="切换视图模式">
                            <button
                                type="button"
                                className={`console-view-toggle-btn${viewMode === "grid" ? " is-active" : ""}`}
                                onClick={() => onViewModeChange("grid")}
                            >
                                <Grid3X3 size={14} />
                                <span>Grid</span>
                            </button>
                            <button
                                type="button"
                                className={`console-view-toggle-btn${viewMode === "list" ? " is-active" : ""}`}
                                onClick={() => onViewModeChange("list")}
                            >
                                <List size={14} />
                                <span>List</span>
                            </button>
                        </div>
                    )}

                    <AniSearch
                        onSearch={onSearchChange}
                        debounceMs={300}
                        persistKey="aniSearch.v1"
                        clearOnBlur={false}
                    />
                    <button
                        type="button"
                        className="console-mobile-menu-btn"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </header>

            <div
                className={`console-mobile-mask${menuOpen ? " is-open" : ""}`}
                onClick={() => setMenuOpen(false)}
            />

            <aside className={`console-mobile-drawer${menuOpen ? " is-open" : ""}`}>
                <div className="console-mobile-drawer-head">
                    <span>Navigation</span>
                    <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                        <X size={16} />
                    </button>
                </div>
                <nav className="console-mobile-nav">
                    {navItems.map((item) => {
                        const active = location.pathname === item.to;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`console-nav-link${active ? " is-active" : ""}`}
                            >
                                <Icon size={16} strokeWidth={2} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
