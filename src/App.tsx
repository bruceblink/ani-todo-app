import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Box, ThemeProvider} from "@mui/material";
import { Toaster } from "react-hot-toast";

// 导入你的页面组件
import theme from "@/theme.ts";
import HomePage from "@/pages/HomePage.tsx";
import Header from "@/components/Header.tsx";
import HistoryPage from "@/pages/HistoryPage.tsx";
import AboutPage from "@/pages/AboutPage.tsx";
import {useState} from "react";
import BackToTop from "@/components/BackToTop.tsx";

export default function App() {
    const [searchValue, setSearchValue] = useState("");

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Header onSearchChange={setSearchValue} />

                <Box
                    component="main"
                    sx={{ paddingTop: '80px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}
                >
                    <Routes>
                        <Route path="/" element={<HomePage searchQuery={searchValue} />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/favorites" element={<HistoryPage searchQuery={searchValue} />} />
                    </Routes>
                </Box>

                <BackToTop />

                <Toaster
                    position="top-center"
                    toastOptions={{
                        className: 'bg-gray-50 dark:bg-slate-600 dark:text-white rounded-md shadow-md',
                    }}
                />
            </Router>
        </ThemeProvider>
    );
}