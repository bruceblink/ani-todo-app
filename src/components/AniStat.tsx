import { useWatchedAni } from "@/hooks/useWatchedAni.ts";

interface Props {
    weekday: string;
    total: number;
}

export default function AniStat({ weekday, total }: Props) {
    const { watchedAniIds } = useWatchedAni();
    const watchedNum = watchedAniIds.size;
    const percentage = total > 0 ? Math.round((watchedNum / total) * 100) : 0;
    const isDone = percentage === 100 && total > 0;

    return (
        <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span
                    style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                    }}
                >
                    {weekday}更新
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    共 {total} 部
                </span>
            </div>

            <div
                style={{
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <div
                    style={{
                        flex: 1,
                        maxWidth: 160,
                        height: 5,
                        background: 'var(--progress-bg)',
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: isDone ? 'var(--color-success)' : 'var(--progress-fill)',
                            borderRadius: 3,
                            transition: 'width 0.4s ease',
                        }}
                    />
                </div>
                <span
                    style={{
                        fontSize: '0.78rem',
                        color: isDone ? 'var(--color-success)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        fontWeight: isDone ? 600 : 400,
                    }}
                >
                    {watchedNum}/{total} · {percentage}%
                </span>
            </div>
        </div>
    );
}
