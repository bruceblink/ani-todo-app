import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tv, RefreshCw, CheckCircle, AlertCircle, ArrowUpCircle } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";

const TECH_STACK = ['React 19', 'TypeScript', 'Tauri v2', 'Rust', 'SQLite', 'MUI'];

interface UpdateStatus {
    available: boolean;
    current_version: string;
    latest_version?: string;
    release_notes?: string;
    release_url?: string;
    published_at?: string;
}

type CheckState =
    | { type: 'idle' }
    | { type: 'checking' }
    | { type: 'up-to-date'; version: string }
    | { type: 'available'; latestVersion: string; notes?: string; url: string; publishedAt?: string }
    | { type: 'error'; message: string };

export default function AboutPage() {
    const [checkState, setCheckState] = useState<CheckState>({ type: 'idle' });
    const [appVersion, setAppVersion] = useState<string>('...');

    useEffect(() => {
        getVersion().then(setAppVersion).catch(() => setAppVersion('0.4.9'));
    }, []);

    const handleCheckUpdate = async () => {
        setCheckState({ type: 'checking' });
        try {
            const status = await invoke<UpdateStatus>('check_for_update');
            if (status.available && status.latest_version && status.release_url) {
                setCheckState({
                    type: 'available',
                    latestVersion: status.latest_version,
                    notes: status.release_notes ?? undefined,
                    url: status.release_url,
                    publishedAt: status.published_at ?? undefined,
                });
            } else {
                setCheckState({ type: 'up-to-date', version: status.current_version });
            }
        } catch (err) {
            setCheckState({ type: 'error', message: String(err) });
        }
    };

    return (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px' }}>
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
                        margin: '0 0 4px',
                        letterSpacing: '-0.02em',
                    }}
                >
                    AniTodo
                </h2>

                {/* Version badge */}
                <div
                    style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 6,
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary-text)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        margin: '0 0 14px',
                    }}
                >
                    v{appVersion}
                </div>

                <p
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.65,
                        margin: '0 0 22px',
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

                {/* Update section */}
                <div
                    style={{
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: 22,
                        marginBottom: 22,
                    }}
                >
                    <UpdateResult state={checkState} />

                    <button
                        onClick={handleCheckUpdate}
                        disabled={checkState.type === 'checking'}
                        style={{
                            marginTop: 14,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '8px 20px',
                            borderRadius: 8,
                            background: checkState.type === 'checking'
                                ? 'var(--color-primary-light)'
                                : 'var(--color-primary)',
                            color: checkState.type === 'checking'
                                ? 'var(--color-primary-text)'
                                : '#fff',
                            fontWeight: 500,
                            fontSize: '0.88rem',
                            border: 'none',
                            cursor: checkState.type === 'checking' ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
                            opacity: checkState.type === 'checking' ? 0.75 : 1,
                        }}
                    >
                        <RefreshCw
                            size={15}
                            strokeWidth={2.2}
                            style={{
                                animation: checkState.type === 'checking'
                                    ? 'spin 1s linear infinite'
                                    : 'none',
                            }}
                        />
                        {checkState.type === 'checking' ? '检查中…' : '检查更新'}
                    </button>
                </div>

                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 20px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                    }}
                >
                    返回主页
                </Link>
            </div>
        </div>
    );
}

function UpdateResult({ state }: { state: CheckState }) {
    if (state.type === 'idle') return null;

    if (state.type === 'up-to-date') {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                }}
            >
                <CheckCircle size={16} strokeWidth={2} />
                已是最新版本 (v{state.version})
            </div>
        );
    }

    if (state.type === 'available') {
        const shortNotes = state.notes
            ? state.notes.replace(/#+\s*/g, '').split('\n').filter(Boolean).slice(0, 3).join('  ·  ')
            : null;

        return (
            <div
                style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    textAlign: 'left',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        color: '#92400e',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        marginBottom: shortNotes ? 8 : 10,
                    }}
                >
                    <ArrowUpCircle size={16} strokeWidth={2} />
                    发现新版本 v{state.latestVersion}
                    {state.publishedAt && (
                        <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#a16207', marginLeft: 4 }}>
                            {state.publishedAt.slice(0, 10)}
                        </span>
                    )}
                </div>

                {shortNotes && (
                    <p
                        style={{
                            margin: '0 0 10px',
                            fontSize: '0.8rem',
                            color: '#78350f',
                            lineHeight: 1.6,
                            wordBreak: 'break-word',
                        }}
                    >
                        {shortNotes}
                    </p>
                )}

                <a
                    href={state.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 14px',
                        borderRadius: 7,
                        background: '#f59e0b',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        textDecoration: 'none',
                        transition: 'opacity 0.15s ease',
                    }}
                >
                    前往下载 →
                </a>
            </div>
        );
    }

    if (state.type === 'error') {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 7,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    lineHeight: 1.5,
                }}
            >
                <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{state.message}</span>
            </div>
        );
    }

    return null;
}
