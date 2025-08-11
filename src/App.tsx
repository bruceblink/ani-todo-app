import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { Toaster } from "react-hot-toast";

// 导入你的页面组件
import theme from "@/theme.ts";
import HomePage from "@/components/HomePage.tsx";
import Header from "@/components/Header.tsx";
import HistoryPage from "@/components/HistoryPage.tsx";
import AboutPage from "@/components/AboutPage.tsx";

export default function App() {

    return (
        <ThemeProvider theme={theme}>
            <Router>
                {/* 将 Header 放在 Routes 外部，使其在所有页面都可见 */}
                <Header />

                {/* 用一个主容器来包裹路由内容，并添加 padding-top */}
                <div style={{ paddingTop: '80px' }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/favorites" element={<HistoryPage />} />
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