import AniImage from "./AniImage";
import {getAniId} from "../utils/utils.ts";

interface Ani {
    title: string;
    update_count: string;
    detail_url: string;
    image_url: string;
    update_info: string;
    update_time: string;
    platform: string;
}

interface Props {
    ani: Ani;
    onClear: (id: string) => void;
}


export default function AniItem({ani, onClear}: Props) {
    const id = getAniId(ani)
    return (
        <div
            className="ani-item"
            key={id}
            style={{display: 'flex', alignItems: 'center', marginBottom: 16}}
        >
            <a href={ani.detail_url} target="_blank" rel="noopener noreferrer">
                <AniImage url={ani.image_url} alt={ani.title} className="ani-img"/>
            </a>
            <div className="ani-info" style={{flex: 1}}>
                <div className="ani-title">{ani.title}</div>
                <div className="ani-update-info">{ani.update_time} 更新</div>
                {ani.update_count ? (
                    <div className="ani-update-info">更新至第 {ani.update_count} 集</div>
                ) : (
                    <div className="ani-update-info">暂无更新信息</div>
                )}
                <div className="ani-platform">{ani.platform}</div>
            </div>
            <button onClick={() => onClear(id)} style={{marginLeft: 12}}>
                清除
            </button>
        </div>
    );
}

// 导出类型定义
export type {Ani};