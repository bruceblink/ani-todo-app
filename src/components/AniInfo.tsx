import type { Ani } from "@/utils/api";
import AniImage from "./AniImage";

interface Props {
    ani: Ani;
    variant?: "grid" | "list";
}

function getPlatformClass(platform: string) {
    const key = platform.toLowerCase();
    if (key.includes("bilibili")) return "pb pb-bilibili";
    if (key.includes("iqiyi")) return "pb pb-iqiyi";
    if (key.includes("tencent")) return "pb pb-tencent";
    if (key.includes("youku")) return "pb pb-youku";
    if (key.includes("age")) return "pb pb-agedm";
    if (key.includes("mikanani")) return "pb pb-mikanani";
    return "pb pb-default";
}

export default function AniInfo({ ani, variant = "grid" }: Props) {
    return (
        <div className={`ani-info ani-info--${variant}`}>
            <a
                href={ani.detail_url}
                target="_blank"
                rel="noopener noreferrer"
                title={`打开《${ani.title}》详情页`}
                className={`ani-cover-link ani-cover-link--${variant}`}
            >
                <AniImage url={ani.image_url} alt={ani.title} className="ani-img" />
            </a>

            <div className="ani-info-text">
                <h3 className="ani-info-title">{ani.title}</h3>

                <div className="ani-info-meta">
                    <div className="ani-info-time">{ani.update_time_str} 更新</div>
                    <div className="ani-info-episode">{ani.update_count ? `第 ${ani.update_count} 集` : "暂无信息"}</div>
                </div>

                <span className={getPlatformClass(ani.platform)}>{ani.platform}</span>
            </div>
        </div>
    );
}
