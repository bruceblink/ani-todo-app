import { Link } from "react-router-dom";
import { Tv } from "lucide-react";

const TECH_STACK = ['React 19', 'TypeScript', 'Tauri v2', 'Rust', 'SQLite', 'MUI'];

export default function AboutPage() {
    return (
        <div
            style={{
                maxWidth: 520,
                margin: '0 auto',
                padding: '48px 24px',
            }}
        >
            <div
                style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 16,
                    padding: '36px 32px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    textAlign: 'center',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 18px',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                    }}
                >
                    <Tv size={28} color="#fff" strokeWidth={2} />
                </div>

                <h2
                    style={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: '0 0 8px',
                        letterSpacing: '-0.02em',
                    }}
                >
                    AniTodo
                </h2>

                <p
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.65,
                        margin: '0 0 24px',
                    }}
                >
                    一款追踪新番更新的桌面应用<br />
                    聚合 Bilibili、爱奇艺、腾讯、优酷等平台
                </p>

                {/* Tech stack badges */}
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginBottom: 28,
                    }}
                >
                    {TECH_STACK.map(tech => (
                        <span
                            key={tech}
                            style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                background: 'var(--color-primary-light)',
                                color: 'var(--color-primary-text)',
                                fontSize: '0.78rem',
                                fontWeight: 500,
                            }}
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 22px',
                        borderRadius: 8,
                        background: 'var(--color-primary)',
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        transition: 'opacity 0.15s ease',
                    }}
                >
                    返回主页
                </Link>
            </div>
        </div>
    );
}
