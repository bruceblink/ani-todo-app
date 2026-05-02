import { Monitor, Moon, Sun, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const THEME_OPTIONS: { value: ThemeMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
        value: 'system',
        label: '跟随系统',
        desc: '根据操作系统的主题设置自动切换',
        icon: <Monitor size={20} strokeWidth={1.8} />,
    },
    {
        value: 'light',
        label: '浅色模式',
        desc: '始终使用明亮的浅色主题',
        icon: <Sun size={20} strokeWidth={1.8} />,
    },
    {
        value: 'dark',
        label: '深色模式',
        desc: '始终使用舒适的深色主题',
        icon: <Moon size={20} strokeWidth={1.8} />,
    },
];

export default function SettingsPage() {
    const { themeMode, setThemeMode } = useTheme();

    return (
        <div
            style={{
                maxWidth: 'var(--content-max-width)',
                margin: '0 auto',
                padding: '22px',
            }}
        >
            <div style={{ maxWidth: 560 }}>
                <div className="settings-card">
                    <h2 className="settings-section-title">外观</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {THEME_OPTIONS.map(opt => {
                            const active = themeMode === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setThemeMode(opt.value)}
                                    className={`settings-theme-btn${active ? ' settings-theme-btn--active' : ''}`}
                                >
                                    <span className={`settings-theme-icon${active ? ' settings-theme-icon--active' : ''}`}>
                                        {opt.icon}
                                    </span>
                                    <span style={{ flex: 1, textAlign: 'left' }}>
                                        <span className="settings-theme-label">{opt.label}</span>
                                        <span className="settings-theme-desc">{opt.desc}</span>
                                    </span>
                                    {active && (
                                        <span className="settings-theme-check">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginTop: 16 }}>
                    <Link to="/" className="about-back-btn">
                        <ChevronLeft size={15} />
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
}
