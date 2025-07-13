
interface RefreshButtonProps {
    loading: boolean;
    onClick: () => void;
}

export default function RefreshButton({ loading, onClick }: RefreshButtonProps) {
    return (
        <button
            className="refresh-btn"
            onClick={onClick}
            disabled={loading}
            aria-label="刷新"
        >
            {loading ? '刷新中…' : '刷新'}
        </button>
    );
}
