import { useState } from "react";
import toast from "react-hot-toast";
import { Star, X } from "lucide-react";
import type { Ani } from "@/utils/api";
import AniInfo from "./AniInfo";

interface Props {
    ani: Ani;
    onClear: (id: number) => void;
    isFavorite: boolean;
    onToggleFavorite: (id: number, aniTitle: string, isFavorite: boolean) => void;
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
            // 如果这个番剧当前在收藏里，就同步清除收藏
            if (isFavorite) {
                onToggleFavorite(ani.id, ani.title, true);
            }
            toast.success(`已经清除了${aniInfo} 这部番剧`);
        }
    };

    const handleFavorClick = () => {
        onToggleFavorite(ani.id, ani.title, isFavorite);
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
                    opacity: isFavorite ? 1 : (isHovered ? 1 : 0),
                    transform: `scale(${isFavorite ? 1 : (isHovered ? 1 : 0.8)})`,
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
            <AniInfo ani={ani} />

        </div>
    );
}