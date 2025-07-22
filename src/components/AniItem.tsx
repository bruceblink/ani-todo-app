import AniImage from "./AniImage";
import toast from "react-hot-toast";
import { Star } from "lucide-react"
import type {Ani} from "@/utils/api";

interface Props {
    ani: Ani;
    onClear: (id: number) => void;
    isFavorite: boolean;
    onToggleFavorite: (id: number, isFavorite: boolean) => void;
}

export default function AniItem({ ani, onClear, isFavorite , onToggleFavorite}: Props) {

    // 点击清除按钮时调用
    const handleClearClick = () => {
        const confirmed = window.confirm(
            `你确定要清除《${ani.title}》这部番剧吗？`
        );
        if (confirmed) {
            onClear(ani.id);
            toast.success(`已经清除了《${ani.title}》这部番剧`);
        }
    };

    const handleFavorClick = () => {
        onToggleFavorite(ani.id, isFavorite)
        toast(isFavorite ? `已取消收藏《${ani.title}》` : `已收藏《${ani.title}》`, {
            icon: isFavorite ? '💔' : '⭐️'
        })
    }

    return (
        <div
            className="ani-item"
            key={ani.id}
            style={{ display: 'flex', alignItems: 'center', marginBottom: 16, position: 'relative' }}
        >
            {/* 收藏图标：绝对定位到左上角 */}
            <button
                onClick={handleFavorClick}
                className={`
                    top-2 left-2
                    p-1 rounded-full
                    hover:bg-gray-100
                    transition
                    ${isFavorite ? 'text-yellow-400' : 'text-gray-300'}
                `}
                title={isFavorite ? '取消收藏' : '收藏'}
            >
                <Star size={24} fill={isFavorite ? '#FBBF24' : 'none'} strokeWidth={2} />
            </button>

            {/* 动漫的封面图片 */}
            <a href={ani.detail_url} target="_blank" rel="noopener noreferrer">
                <AniImage url={ani.image_url} alt={ani.title} className="ani-img" />
            </a>

            {/* 动漫的信息说明 */}
            <div className="ani-info" style={{ flex: 1 }}>
                <div className="ani-title">{ani.title}</div>
                <div className="ani-update-info">{ani.update_time} 更新</div>
                {ani.update_count ? (
                    <div className="ani-update-info">更新至第 {ani.update_count} 集</div>
                ) : (
                    <div className="ani-update-info">暂无更新信息</div>
                )}
                <div className="ani-platform">{ani.platform}</div>
            </div>

            <button
                className="clear-btn"
                onClick={handleClearClick}
                style={{ marginLeft: 12 }}
            >
                清除
            </button>
        </div>

    );
}