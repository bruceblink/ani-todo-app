import {RefreshCcw} from "lucide-react";

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
            style={{
                position: 'fixed',
                right: '16px',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '50%',
                padding: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                opacity: loading ? 0.5 : 1,
                transition: 'transform 0.3s ease-in-out',
            }}
            title="同步最新数据"
        >
            <RefreshCcw
                size={20}
                color={loading ? '#aaa' : '#333'}
                className={loading ? 'spin' : ''}
            />
        </button>
    );
}
