import {useWatchedAni} from "@/hooks/useWatchedAni.ts";


interface Props {
    weekday: string;
    total: number;
}

export default function AniStat({ weekday, total}: Props) {

    const { watchedAniIds } = useWatchedAni();
    const watchedNum = watchedAniIds.size;
    const percentage = total > 0 ? Math.round((watchedNum / total) * 100) : 0;

    return(
        <>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'var(--text-color, #333)'
                }}>
                    今日({weekday})更新番剧 共 {total} 部
                </h1>
                <div style={{ marginTop: 8, fontSize: '1rem', color: 'var(--sub-text-color, #555)' }}>
                    已观看 {watchedNum} 部 — {percentage}% 完成
                </div>
                <div style={{ width: 200, height: 12, background: 'var(--progress-bg, #ddd)', borderRadius: 6, overflow: 'hidden', margin: '12px 0 0 0' }}>
                    <div
                        style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'var(--progress-fill, #afe1b0)',
                            transition: 'width 0.3s ease',
                        }}
                    />
                </div>
            </div>
        </>
    )
}