import {useWatchedAni} from "@/hooks/useWatchedAni.ts";

interface Props {
    weekday: string;  // 星期几
    total: number;    // 总数
}

export default function Header({ weekday, total}: Props) {
    const { watchedAniIds } = useWatchedAni()
    const watchedNum = watchedAniIds.size
    const percentage = total > 0 ? Math.round((watchedNum / total) * 100) : 0;
    return (
        <div className="header">
            <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                    今日({weekday})更新番剧 共 {total} 部
                </h1>
                <div style={{ marginTop: '8px', fontSize: '1rem', color: '#555' }}>
                    已观看 {watchedNum} 部 — {percentage}% 完成
                </div>
            </div>
            <div style={{ width: '200px', height: '12px', background: '#ddd', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                    style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: '#afe1b0',
                        transition: 'width 0.3s ease',
                    }}
                />
            </div>
        </div>
    );
}