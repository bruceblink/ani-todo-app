import type { Ani } from "@/utils/api";
import AniImage from "./AniImage";

interface Props {
    ani: Ani;
}

function getPlatformClass(platform: string) {
    const key = platform.toLowerCase();
    if (key.includes('bilibili')) return 'pb pb-bilibili';
    if (key.includes('iqiyi'))    return 'pb pb-iqiyi';
    if (key.includes('tencent'))  return 'pb pb-tencent';
    if (key.includes('youku'))    return 'pb pb-youku';
    if (key.includes('age'))      return 'pb pb-agedm';
    if (key.includes('mikanani')) return 'pb pb-mikanani';
    return 'pb pb-default';
}

export default function AniInfo({ ani }: Props) {
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
                className="ani-cover-link"
                style={{
                    display: 'block',
                    width: 76,
                    height: 108,
                    borderRadius: 8,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
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

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {ani.update_time_str} 更新
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {ani.update_count ? `第 ${ani.update_count} 集` : '暂无信息'}
                </div>

                <div>
                    <span className={getPlatformClass(ani.platform)}>
                        {ani.platform}
                    </span>
                </div>
            </div>
        </div>
    );
}
