import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { useMemo, useState, useEffect } from "react";

import { buildTheme } from "@/theme.ts";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import HomePage from "@/pages/HomePage.tsx";
import Header from "@/components/Header.tsx";
import HistoryPage from "@/pages/HistoryPage.tsx";
import AboutPage from "@/pages/AboutPage.tsx";
import SettingsPage from "@/pages/SettingsPage.tsx";
import BackToTop from "@/components/BackToTop.tsx";

export type LayoutMode = "grid" | "list";

function AppInner() {
    const [searchValue, setSearchValue] = useState("");
    const [viewMode, setViewMode] = useState<LayoutMode>(() => {
        try {
            const saved = localStorage.getItem("homeLayoutMode.v1");
            return saved === "list" ? "list" : "grid";
        } catch {
            return "grid";
        }
    });
    const { resolvedDark } = useTheme();
    const theme = useMemo(() => buildTheme(resolvedDark ? 'dark' : 'light'), [resolvedDark]);

    useEffect(() => {
        try {
            localStorage.setItem("homeLayoutMode.v1", viewMode);
        } catch {
        }
    }, [viewMode]);

    return (
        <MuiThemeProvider theme={theme}>
            <Router>
                <Box className="console-shell">
                    <Header
                        onSearchChange={setSearchValue}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />

                    <Box component="main" className="console-main">
                        <Routes>
                            <Route path="/" element={<HomePage searchQuery={searchValue} viewMode={viewMode} />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/favorites" element={<HistoryPage searchQuery={searchValue} />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </Box>
                </Box>

                <BackToTop />

                <Toaster
                    position="top-center"
                    toastOptions={{
                        className: 'bg-gray-50 dark:bg-slate-600 dark:text-white rounded-md shadow-md',
                    }}
                />
            </Router>
        </MuiThemeProvider>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppInner />
        </ThemeProvider>
    );
}
