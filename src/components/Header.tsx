interface Props {
    weekday: string;  // 星期几
    total: number;    // 总数
    watched: number;  // 已观看
}

export default function Header({ weekday, total, watched }: Props) {
    const percentage = total > 0 ? Math.round((watched / total) * 100) : 0;
    return (
        <div className="header">
            <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                    今日({weekday})更新番剧 共 {total} 部
                </h1>
                <div style={{ marginTop: '8px', fontSize: '1rem', color: '#555' }}>
                    已观看 {watched} 部 — {percentage}% 完成
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