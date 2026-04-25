import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tv, RefreshCw, CheckCircle, AlertCircle, ArrowUpCircle, Download } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";

const TECH_STACK = ['React 19', 'TypeScript', 'Tauri v2', 'Rust', 'SQLite', 'MUI'];

interface UpdateStatus {
    available: boolean;
    current_version: string;
    latest_version?: string;
    release_notes?: string;
}

interface DownloadProgress {
    downloaded: number;
    total: number | null;
}

type CheckState =
    | { type: 'idle' }
    | { type: 'checking' }
    | { type: 'up-to-date'; version: string }
    | { type: 'available'; latestVersion: string; notes?: string }
    | { type: 'installing'; progress: DownloadProgress | null }
    | { type: 'installed' }
    | { type: 'error'; message: string };

export default function AboutPage() {
    const [checkState, setCheckState] = useState<CheckState>({ type: 'idle' });
    const [appVersion, setAppVersion] = useState<string>('...');

    useEffect(() => {
        getVersion().then(setAppVersion).catch(() => setAppVersion('0.4.9'));
    }, []);

    // 监听来自 Rust 的下载进度事件
    useEffect(() => {
        if (checkState.type !== 'installing') return;

        let unlisten: (() => void) | null = null;

        listen<DownloadProgress>('update:progress', (e) => {
            setCheckState({ type: 'installing', progress: e.payload });
        }).then((fn) => {
            unlisten = fn;
        });

        return () => unlisten?.();
    }, [checkState.type]);

    const handleCheckUpdate = async () => {
        setCheckState({ type: 'checking' });
        try {
            const status = await invoke<UpdateStatus>('check_for_update');
            if (status.available && status.latest_version) {
                setCheckState({
                    type: 'available',
                    latestVersion: status.latest_version,
                    notes: status.release_notes ?? undefined,
                });
            } else {
                setCheckState({ type: 'up-to-date', version: status.current_version });
            }
        } catch (err) {
            setCheckState({ type: 'error', message: String(err) });
        }
    };

    const handleInstall = async () => {
        setCheckState({ type: 'installing', progress: null });
        try {
            await invoke('install_update');
            setCheckState({ type: 'installed' });
        } catch (err) {
            setCheckState({ type: 'error', message: String(err) });
        }
    };

    const handleRestart = async () => {
        await invoke('restart_app');
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
                        width: 60, height: 60,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 18px',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                    }}
                >
                    <Tv size={28} color="#fff" strokeWidth={2} />
                </div>

                <h2 style={{
                    fontSize: '1.4rem', fontWeight: 700,
                    color: 'var(--text-primary)', margin: '0 0 4px',
                    letterSpacing: '-0.02em',
                }}>
                    AniTodo
                </h2>

                <div style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 6,
                    background: 'var(--color-primary-light)', color: 'var(--color-primary-text)',
                    fontSize: '0.78rem', fontWeight: 600, margin: '0 0 14px',
                }}>
                    v{appVersion}
                </div>

                <p style={{
                    color: 'var(--text-secondary)', fontSize: '0.9rem',
                    lineHeight: 1.65, margin: '0 0 22px',
                }}>
                    一款追踪新番更新的桌面应用<br />
                    聚合 Bilibili、爱奇艺、腾讯、优酷等平台
                </p>

                {/* Tech stack */}
                <div style={{
                    display: 'flex', gap: 8, justifyContent: 'center',
                    flexWrap: 'wrap', marginBottom: 28,
                }}>
                    {TECH_STACK.map(tech => (
                        <span key={tech} style={{
                            padding: '4px 10px', borderRadius: 6,
                            background: 'var(--color-primary-light)',
                            color: 'var(--color-primary-text)',
                            fontSize: '0.78rem', fontWeight: 500,
                        }}>
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Update section */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 22, marginBottom: 22 }}>
                    <UpdateResult
                        state={checkState}
                        onInstall={handleInstall}
                        onRestart={handleRestart}
                    />

                    {/* 检查更新按钮：只在 idle / up-to-date / error 状态下显示 */}
                    {(checkState.type === 'idle' || checkState.type === 'up-to-date' || checkState.type === 'error') && (
                        <button
                            onClick={handleCheckUpdate}
                            style={{
                                marginTop: 14,
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '8px 20px', borderRadius: 8,
                                background: 'var(--color-primary)', color: '#fff',
                                fontWeight: 500, fontSize: '0.88rem', border: 'none',
                                cursor: 'pointer', transition: 'opacity 0.15s ease',
                            }}
                        >
                            <RefreshCw size={15} strokeWidth={2.2} />
                            检查更新
                        </button>
                    )}

                    {/* 检查中 spinner */}
                    {checkState.type === 'checking' && (
                        <div style={{
                            marginTop: 14, display: 'inline-flex',
                            alignItems: 'center', gap: 7,
                            color: 'var(--text-secondary)', fontSize: '0.88rem',
                        }}>
                            <RefreshCw
                                size={15} strokeWidth={2.2}
                                style={{ animation: 'spin 1s linear infinite' }}
                            />
                            正在检查…
                        </div>
                    )}
                </div>

                <Link to="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 20px', borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', fontWeight: 500,
                    fontSize: '0.88rem', textDecoration: 'none',
                    transition: 'all 0.15s ease',
                }}>
                    返回主页
                </Link>
            </div>
        </div>
    );
}

interface UpdateResultProps {
    state: CheckState;
    onInstall: () => void;
    onRestart: () => void;
}

function UpdateResult({ state, onInstall, onRestart }: UpdateResultProps) {
    if (state.type === 'idle' || state.type === 'checking') return null;

    if (state.type === 'up-to-date') {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px 16px', borderRadius: 10,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#15803d', fontSize: '0.88rem', fontWeight: 500,
            }}>
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
            <div style={{
                padding: '14px 16px', borderRadius: 10, textAlign: 'left',
                background: '#fffbeb', border: '1px solid #fde68a',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    color: '#92400e', fontWeight: 600, fontSize: '0.9rem',
                    marginBottom: shortNotes ? 8 : 12,
                }}>
                    <ArrowUpCircle size={16} strokeWidth={2} />
                    发现新版本 v{state.latestVersion}
                </div>
                {shortNotes && (
                    <p style={{
                        margin: '0 0 12px', fontSize: '0.8rem',
                        color: '#78350f', lineHeight: 1.6, wordBreak: 'break-word',
                    }}>
                        {shortNotes}
                    </p>
                )}
                <button
                    onClick={onInstall}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 7,
                        background: '#f59e0b', color: '#fff',
                        fontWeight: 600, fontSize: '0.82rem', border: 'none',
                        cursor: 'pointer', transition: 'opacity 0.15s ease',
                    }}
                >
                    <Download size={14} strokeWidth={2.2} />
                    立即安装
                </button>
            </div>
        );
    }

    if (state.type === 'installing') {
        const { progress } = state;
        const percent = progress?.total
            ? Math.round((progress.downloaded / progress.total) * 100)
            : null;
        const downloadedMB = progress ? (progress.downloaded / 1024 / 1024).toFixed(1) : '0';
        const totalMB = progress?.total ? (progress.total / 1024 / 1024).toFixed(1) : null;

        return (
            <div style={{
                padding: '14px 16px', borderRadius: 10, textAlign: 'left',
                background: '#eff6ff', border: '1px solid #bfdbfe',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10,
                }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e40af' }}>
                        正在下载更新…
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#3b82f6' }}>
                        {percent !== null ? `${percent}%` : `${downloadedMB} MB`}
                        {totalMB && ` / ${totalMB} MB`}
                    </span>
                </div>
                <div style={{
                    height: 5, background: '#bfdbfe',
                    borderRadius: 3, overflow: 'hidden',
                }}>
                    <div style={{
                        width: percent !== null ? `${percent}%` : '100%',
                        height: '100%', background: '#3b82f6', borderRadius: 3,
                        transition: 'width 0.3s ease',
                        animation: percent === null ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    }} />
                </div>
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}</style>
            </div>
        );
    }

    if (state.type === 'installed') {
        return (
            <div style={{
                padding: '14px 16px', borderRadius: 10, textAlign: 'left',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    color: '#15803d', fontWeight: 600, fontSize: '0.88rem',
                    marginBottom: 12,
                }}>
                    <CheckCircle size={16} strokeWidth={2} />
                    更新已安装，重启后生效
                </div>
                <button
                    onClick={onRestart}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 7,
                        background: '#10b981', color: '#fff',
                        fontWeight: 600, fontSize: '0.82rem', border: 'none',
                        cursor: 'pointer', transition: 'opacity 0.15s ease',
                    }}
                >
                    立即重启
                </button>
            </div>
        );
    }

    if (state.type === 'error') {
        return (
            <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 7,
                padding: '10px 14px', borderRadius: 10,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#991b1b', fontSize: '0.82rem', textAlign: 'left', lineHeight: 1.5,
            }}>
                <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{state.message}</span>
            </div>
        );
    }

    return null;
}
