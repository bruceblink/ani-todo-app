import type { ReactNode } from "react";
import { Monitor, Moon, Sun, Palette, Check, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const THEME_OPTIONS: { value: ThemeMode; label: string; desc: string; icon: ReactNode }[] = [
    {
        value: "system",
        label: "跟随系统",
        desc: "根据操作系统主题自动切换",
        icon: <Monitor size={18} strokeWidth={1.9} />,
    },
    {
        value: "light",
        label: "浅色模式",
        desc: "始终使用明亮的浅色主题",
        icon: <Sun size={18} strokeWidth={1.9} />,
    },
    {
        value: "dark",
        label: "深色模式",
        desc: "始终使用舒适的深色主题",
        icon: <Moon size={18} strokeWidth={1.9} />,
    },
];

export default function SettingsPage() {
    const { themeMode, setThemeMode } = useTheme();

    return (
        <div className="console-page-wrap">
            <div className="console-page-head">
                <span className="console-page-head-icon">
                    <Palette size={16} strokeWidth={2.1} />
                </span>
                <h2 className="console-page-head-title">设置</h2>
            </div>

            <section className="console-panel">
                <header className="console-panel-head">
                    <h3 className="console-panel-title">外观主题</h3>
                    <p className="console-panel-desc">选择应用界面显示风格</p>
                </header>

                <div className="settings-theme-list">
                    {THEME_OPTIONS.map((opt) => {
                        const active = themeMode === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setThemeMode(opt.value)}
                                className={`settings-theme-option${active ? " is-active" : ""}`}
                            >
                                <span className={`settings-theme-option__icon${active ? " is-active" : ""}`}>
                                    {opt.icon}
                                </span>
                                <span className="settings-theme-option__content">
                                    <span className="settings-theme-option__label">{opt.label}</span>
                                    <span className="settings-theme-option__desc">{opt.desc}</span>
                                </span>
                                {active && <Check size={15} strokeWidth={2.4} className="settings-theme-option__check" />}
                            </button>
                        );
                    })}
                </div>
            </section>

            <div className="console-page-foot">
                <Link to="/" className="console-inline-back">
                    <ChevronLeft size={15} strokeWidth={2.3} />
                    返回主页
                </Link>
            </div>
        </div>
    );
}
