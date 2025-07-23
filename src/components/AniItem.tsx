import { useState } from "react";
import AniImage from "./AniImage";
import toast from "react-hot-toast";
import { Star, X } from "lucide-react";
import type { Ani } from "@/utils/api";

interface Props {
    ani: Ani;
    onClear: (id: number) => void;
    isFavorite: boolean;
    onToggleFavorite: (id: number, isFavorite: boolean) => void;
}

export default function AniItem({ ani, onClear, isFavorite, onToggleFavorite }: Props) {
    const aniInfo = `《${ani.title}》第${ani.update_count}集`;
    const [isHovered, setIsHovered] = useState(false);
    
    const handleClearClick = () => {
        const confirmed = window.confirm(
            `你确定要清除${aniInfo} 这部番剧吗？`
        );
        if (confirmed) {
            onClear(ani.id);
            toast.success(`已经清除了${aniInfo} 这部番剧`);
        }
    };

    const handleFavorClick = () => {
        onToggleFavorite(ani.id, isFavorite);
        toast(isFavorite ? `已取消收藏《${ani.title}》` : `已收藏《${ani.title}》`, {
            icon: isFavorite ? '💔' : '⭐️'
        });
    };

    return (
        <div 
            className="ani-item"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                position: 'relative',
                padding: 16,
                background: '#fff',
                borderRadius: 12,
                boxShadow: isHovered 
                    ? '0 16px 32px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                border: `1px solid ${isHovered ? '#646cff' : '#eee'}`,
                transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s ease',
                cursor: 'default',
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'none',
                minHeight: '100%'
            }}
        >
            {/* 收藏按钮：绝对定位到卡片左上角 */}
            <button
                onClick={handleFavorClick}
                style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    background: isHovered ? '#fff' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isHovered 
                        ? '0 4px 12px rgba(251, 191, 36, 0.3)' 
                        : '0 2px 4px rgba(0,0,0,0.1)',
                    opacity: isHovered ? 1 : 0,
                    transform: `scale(${isHovered ? 1 : 0.8})`,
                    zIndex: 10,
                }}
                title={isFavorite ? '取消收藏' : '收藏'}
            >
                <Star 
                    size={18}
                    fill={isFavorite ? '#FBBF24' : 'none'} 
                    color={isFavorite ? '#FBBF24' : '#666'}
                    strokeWidth={2.5}
                />
            </button>

            {/* 清除按钮：绝对定位到右上角 */}
            <button
                onClick={handleClearClick}
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    background: isHovered ? 'rgba(255, 59, 48, 0.95)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isHovered 
                        ? '0 4px 8px rgba(255, 59, 48, 0.25)' 
                        : '0 2px 4px rgba(0,0,0,0.1)',
                    opacity: isHovered ? 1 : 0,
                    transform: `scale(${isHovered ? 1 : 0.8})`,
                    color: isHovered ? '#fff' : '#666',
                    zIndex: 10,
                }}
                title="清除此番剧"
            >
                <X 
                    size={18}
                    color={isHovered ? '#fff' : '#666'}
                    strokeWidth={2.5}
                />
            </button>
            <div className="ani-info" style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: 32,  // 添加上边距，避免被按钮遮挡
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

        </div>
    );
}