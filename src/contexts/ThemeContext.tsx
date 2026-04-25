import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    resolvedDark: boolean;  // actual dark/light after resolving 'system'
}

const ThemeContext = createContext<ThemeContextValue>({
    themeMode: 'system',
    setThemeMode: () => {},
    resolvedDark: false,
});

const STORAGE_KEY = 'ani-theme-mode';

function getSystemDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
        return 'system';
    });
    const [systemDark, setSystemDark] = useState(getSystemDark);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const resolvedDark = themeMode === 'system' ? systemDark : themeMode === 'dark';

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', resolvedDark ? 'dark' : 'light');
    }, [resolvedDark]);

    const setThemeMode = (mode: ThemeMode) => {
        localStorage.setItem(STORAGE_KEY, mode);
        setThemeModeState(mode);
    };

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, resolvedDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
