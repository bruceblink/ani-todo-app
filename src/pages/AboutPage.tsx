import {Link} from "react-router-dom";

export default function AboutPage() {

    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2>关于本应用</h2>
            <p>这是一个用于追踪新番的应用，基于 React、Tailwind CSS、 Vite + Tauri 构建。</p>
            <Link to="/">返回主页</Link>
        </div>
    )
}