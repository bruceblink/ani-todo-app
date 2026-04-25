import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Tv, RefreshCw, CheckCircle, AlertCircle,
    ArrowUpCircle, Download, RotateCcw, ChevronLeft,
} from "lucide-react";
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
        getVersion().then(setAppVersion).catch(() => setAppVersion('1.0.0'));
    }, []);

    useEffect(() => {
        if (checkState.type !== 'installing') return;
        let unlisten: (() => void) | null = null;
        listen<DownloadProgress>('update:progress', (e) => {
            setCheckState({ type: 'installing', progress: e.payload });
        }).then((fn) => { unlisten = fn; });
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

    const showCheckBtn =
        checkState.type === 'idle' ||
        checkState.type === 'up-to-date' ||
        checkState.type === 'error';

    return (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px' }}>
            <div className="about-card">

                {/* Logo */}
                <div className="about-logo">
                    <Tv size={30} color="#fff" strokeWidth={2} />
                </div>

                <h2 className="about-title">FanJi</h2>

                <div className="about-version">v{appVersion}</div>

                <p className="about-desc">
                    一款追踪新番更新的桌面应用<br />
                    聚合 Bilibili、爱奇艺、腾讯、优酷等平台
                </p>

                {/* Tech stack */}
                <div className="about-stack">
                    {TECH_STACK.map(tech => (
                        <span key={tech} className="about-stack__chip">{tech}</span>
                    ))}
                </div>

                {/* Update section */}
                <div className="about-update-section">
                    <UpdateResult
                        state={checkState}
                        onInstall={handleInstall}
                        onRestart={handleRestart}
                    />

                    {showCheckBtn && (
                        <button className="about-check-btn" onClick={handleCheckUpdate}>
                            <RefreshCw size={15} strokeWidth={2.2} />
                            检查更新
                        </button>
                    )}

                    {checkState.type === 'checking' && (
                        <div className="about-checking">
                            <RefreshCw
                                size={15}
                                strokeWidth={2.2}
                                style={{ animation: 'spin 1s linear infinite' }}
                            />
                            正在检查…
                        </div>
                    )}
                </div>

                <Link to="/" className="about-back-btn">
                    <ChevronLeft size={15} strokeWidth={2.5} />
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
            <div className="upd-panel upd-panel--success">
                <span className="upd-label--success">
                    <CheckCircle size={16} strokeWidth={2} />
                    已是最新版本 (v{state.version})
                </span>
            </div>
        );
    }

    if (state.type === 'available') {
        const shortNotes = state.notes
            ? state.notes.replace(/#+\s*/g, '').split('\n').filter(Boolean).slice(0, 3).join('  ·  ')
            : null;

        return (
            <div className="upd-panel upd-panel--warning">
                <div className="upd-label--warning">
                    <ArrowUpCircle size={17} strokeWidth={2} />
                    发现新版本 v{state.latestVersion}
                </div>
                {shortNotes && <p className="upd-notes">{shortNotes}</p>}
                <button className="upd-install-btn" onClick={onInstall}>
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
            <div className="upd-panel upd-panel--info">
                <div className="upd-label--info">
                    <span>正在下载更新…</span>
                    <span className="upd-size">
                        {percent !== null ? `${percent}%` : `${downloadedMB} MB`}
                        {totalMB && ` / ${totalMB} MB`}
                    </span>
                </div>
                <div className="upd-progress-track">
                    <div
                        className="upd-progress-fill"
                        style={{
                            width: percent !== null ? `${percent}%` : '100%',
                            animation: percent === null ? 'pulse 1.5s ease-in-out infinite' : 'none',
                        }}
                    />
                </div>
            </div>
        );
    }

    if (state.type === 'installed') {
        return (
            <div className="upd-panel upd-panel--success" style={{ marginBottom: 12 }}>
                <div className="upd-label--success" style={{ marginBottom: 12 }}>
                    <CheckCircle size={16} strokeWidth={2} />
                    更新已安装，重启后生效
                </div>
                <button className="upd-restart-btn" onClick={onRestart}>
                    <RotateCcw size={14} strokeWidth={2.2} />
                    立即重启
                </button>
            </div>
        );
    }

    if (state.type === 'error') {
        return (
            <div className="upd-panel upd-panel--error">
                <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1, color: '#991b1b' }} />
                <span className="upd-label--error">{state.message}</span>
            </div>
        );
    }

    return null;
}
