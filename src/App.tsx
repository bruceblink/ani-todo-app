import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { Toaster } from "react-hot-toast";

// 导入你的页面组件
import theme from "@/theme.ts";
import HomePage from "@/components/HomePage.tsx";

// 占位页面：关于我们
const AboutPage = () => {
    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2>关于本应用</h2>
            <p>这是一个用于追踪新番的应用，基于 React 和 Tailwind CSS 构建。</p>
            <Link to="/">返回主页</Link>
        </div>
    );
};

// 占位页面：关注列表
const FavoritesPage = () => {
    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2>我的关注</h2>
            <p>这里将显示你关注的所有番剧。</p>
            <Link to="/">返回主页</Link>
        </div>
    );
};

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

                    {/* 添加一个导航栏，放在 <Routes> 外部，以便在所有页面显示 */}
                    <header style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        gap: '16px'
                    }}>
                        <Link to="/">主页</Link>
                        <Link to="/favorites">关注列表</Link>
                        <Link to="/about">关于</Link>
                    </header>

                    <main style={{ flexGrow: 1, padding: '16px' }}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/favorites" element={<FavoritesPage />} />
                            <Route path="/about" element={<AboutPage />} />
                        </Routes>
                    </main>
                </div>
            </Router>
            <Toaster
                position="top-center"
                toastOptions={{
                    className:
                        'bg-gray-50 dark:bg-slate-600 dark:text-white rounded-md shadow-md',
                }}
            />
        </ThemeProvider>
    );
}