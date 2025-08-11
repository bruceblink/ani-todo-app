import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { Toaster } from "react-hot-toast";

// 导入你的页面组件
import theme from "@/theme.ts";
import HomePage from "@/components/HomePage.tsx";
import Header from "@/components/Header.tsx";

// 占位页面：关于我们
const AboutPage = () => {
    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2>关于本应用</h2>
            <p>这是一个用于追踪新番的应用，基于 React、Tailwind CSS、 Vite + Tauri 构建。</p>
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
    const HEADER_HEIGHT = '80px'; // 估算你的 Header 高度，用于内容区域的 padding

    return (
        <ThemeProvider theme={theme}>
            <Router>
                {/* 将 Header 放在 Routes 外部，使其在所有页面都可见 */}
                <Header />

                {/* 用一个主容器来包裹路由内容，并添加 padding-top */}
                <div style={{ paddingTop: HEADER_HEIGHT }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                    </Routes>
                </div>

                <Toaster
                    position="top-center"
                    toastOptions={{
                        className:
                            'bg-gray-50 dark:bg-slate-600 dark:text-white rounded-md shadow-md',
                    }}
                />
            </Router>
        </ThemeProvider>
    );
}