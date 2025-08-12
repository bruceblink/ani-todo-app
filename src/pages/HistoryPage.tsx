import {Link} from "react-router-dom";

export default function HistoryPage() {
    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2>观看历史</h2>
            <p>这里将显示你观看过的所有番剧。</p>
            <Link to="/">返回主页</Link>
        </div>
    )
}