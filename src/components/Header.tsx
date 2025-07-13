
type Props = {
    title: string;
    total: number;
    loading: boolean;
    onRefresh: () => void;
};

export default function Header({ title, total, loading, onRefresh }: Props) {
    return (
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>{title} 更新番剧 共 {total} 部</h1>
            <button onClick={onRefresh} disabled={loading}>
                {loading ? '刷新中…' : '刷新'}
            </button>
        </div>
    );
}
