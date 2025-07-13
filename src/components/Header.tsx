interface Props {
    weekday: string;
    total: number;
}

export default function Header({ weekday, total }: Props) {
    return (
        <div
            className="header"
            style={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <h1>
                {weekday} 更新番剧 共 {total} 部
            </h1>
        </div>
    );
}
