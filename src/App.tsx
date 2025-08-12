import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { Toaster } from "react-hot-toast";

// 导入你的页面组件
import theme from "@/theme.ts";
import HomePage from "@/pages/HomePage.tsx";
import Header from "@/components/Header.tsx";
import HistoryPage from "@/pages/HistoryPage.tsx";
import AboutPage from "@/pages/AboutPage.tsx";
import {useState} from "react";

export default function App() {
    const [searchValue, setSearchValue] = useState("");
    return (
        <ThemeProvider theme={theme}>
            <Router>
                {/* 将 Header 放在 Routes 外部，使其在所有页面都可见 */}
                {/* 传递搜索状态和修改函数给 Header */}
                <Header onSearchChange={setSearchValue} />

                {/* 用一个主容器来包裹路由内容，并添加 padding-top */}
                <div style={{ paddingTop: '80px' }}>
                    <Routes>
                        <Route path="/" element={<HomePage searchQuery={searchValue} />} />
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