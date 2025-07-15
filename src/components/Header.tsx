interface Props {
    weekday: string;  // 星期几
    total: number;    // 总数
    watched: number;  // 已观看
}

export default function Header({ weekday, total, watched }: Props) {
    const percentage = total > 0 ? Math.round((watched / total) * 100) : 0;
    return (
        <div
            className="header"
            style={{
                position: "fixed",
                display: 'flex',
                alignItems: 'center',
                width: '600px',
                justifyContent: 'space-between',
                margin: '0 16px',
                padding: '16px',
                background: 'rgba(124, 151, 198)', // 使用rgba设置透明度
                borderRadius: '8px',
                marginBottom: '16px',
                // 可选：添加模糊效果增强半透明效果
                backdropFilter: 'blur(5px)',
            }}
        >
            <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                    {weekday} 更新番剧 共 {total} 部
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