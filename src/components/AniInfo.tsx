import type { Ani } from "@/utils/api";
import AniImage from "./AniImage";

interface Props {
    ani: Ani;
}

// Platform-specific badge colors
const PLATFORM_STYLES: Record<string, { bg: string; color: string; darkBg: string; darkColor: string }> = {
    bilibili: { bg: '#e8f7ff', color: '#0099cc', darkBg: '#0c2a3a', darkColor: '#38bdf8' },
    iqiyi:    { bg: '#e6fce8', color: '#00850a', darkBg: '#082810', darkColor: '#4ade80' },
    tencent:  { bg: '#e8f1ff', color: '#1677ff', darkBg: '#0a1e40', darkColor: '#60a5fa' },
    youku:    { bg: '#e8fafe', color: '#0088aa', darkBg: '#0a2530', darkColor: '#22d3ee' },
    agedm:    { bg: '#fff2e8', color: '#c84000', darkBg: '#2a1000', darkColor: '#fb923c' },
    age:      { bg: '#fff2e8', color: '#c84000', darkBg: '#2a1000', darkColor: '#fb923c' },
    mikanani: { bg: '#fffbeb', color: '#a16207', darkBg: '#2a1d00', darkColor: '#fbbf24' },
};

function getPlatformStyle(platform: string) {
    const key = platform.toLowerCase();
    for (const [name, style] of Object.entries(PLATFORM_STYLES)) {
        if (key.includes(name)) return style;
    }
    return { bg: '#f3f4f6', color: '#6b7280', darkBg: '#1f2937', darkColor: '#9ca3af' };
}

export default function AniInfo({ ani }: Props) {
    const ps = getPlatformStyle(ani.platform);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 14px',
                width: '100%',
                height: '100%',
            }}
        >
            {/* Cover image */}
            <a
                href={ani.detail_url}
                target="_blank"
                rel="noopener noreferrer"
                title={`打开《${ani.title}》详情页`}
                style={{
                    display: 'block',
                    width: 76,
                    height: 108,
                    borderRadius: 8,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
            >
                <AniImage url={ani.image_url} alt={ani.title} className="ani-img" />
            </a>

            {/* Info text */}
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                    paddingTop: 2,
                    paddingRight: 20,
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                    }}
                >
                    {ani.title}
                </h3>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {ani.update_time_str} 更新
                </div>

                <div
                    style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                    }}
                >
                    {ani.update_count ? `第 ${ani.update_count} 集` : '暂无信息'}
                </div>

                <div>
                    <span
                        style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 5,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: ps.bg,
                            color: ps.color,
                            letterSpacing: '0.01em',
                        }}
                    >
                        {ani.platform}
                    </span>
                </div>
            </div>
        </div>
    );
}
