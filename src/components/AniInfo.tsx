import type { Ani } from "@/utils/api";
import AniImage from "./AniImage";

interface Props {
    ani: Ani;
}

export default function AniInfo({ ani }: Props) {
    return (
        <div className="ani-info" style={{ 
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            paddingTop: 32,
            width: '100%'
        }}>
            {/* 动漫的封面图片 */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <a 
                    href={ani.detail_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title={`在新窗口打开《${ani.title}》详情`}
                    style={{
                        display: 'block',
                        width: 120,
                        height: 160,
                        borderRadius: 8,
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <AniImage 
                        url={ani.image_url} 
                        alt={ani.title} 
                        className="ani-img"
                    />
                </a>
            </div>

            {/* 动漫的信息说明 */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ 
                    margin: '0 0 8px', 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {ani.title}
                </h3>
                <div style={{ 
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: 4,
                }}>
                    {ani.update_time} 更新
                </div>
                <div style={{ 
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: 8,
                }}>
                    {ani.update_count ? (
                        <>更新至第 {ani.update_count} 集</>
                    ) : (
                        <>暂无更新信息</>
                    )}
                </div>
                <div style={{ 
                    fontSize: '0.85rem',
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <span style={{
                        padding: '2px 8px',
                        background: '#f5f5f5',
                        borderRadius: 4,
                    }}>
                        {ani.platform}
                    </span>
                </div>
            </div>
        </div>
    );
}
