import { createTheme, type PaletteMode } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

export function buildTheme(mode: PaletteMode) {
    const isDark = mode === 'dark';

    return createTheme({
        palette: {
            mode,
            primary: {
                main: isDark ? '#818cf8' : '#6366f1',
                dark: '#4f46e5',
                light: isDark ? '#1e1b4b' : '#e0e7ff',
                contrastText: '#ffffff',
            },
            success: {
                main: '#10b981',
                contrastText: '#ffffff',
            },
            error: {
                main: '#ef4444',
            },
            background: {
                default: isDark ? '#0f172a' : '#f5f7fa',
                paper: isDark ? '#1e293b' : '#ffffff',
            },
            text: {
                primary: isDark ? '#f1f5f9' : '#111827',
                secondary: isDark ? '#94a3b8' : '#6b7280',
            },
            divider: isDark ? '#334155' : '#e5e7eb',
        },
        components: {
            MuiDialog: {
                defaultProps: {
                    fullWidth: true,
                    maxWidth: 'xs',
                },
                styleOverrides: {
                    paper: {
                        borderRadius: '16px',
                        width: '360px',
                        maxWidth: '90vw',
                    },
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        fontWeight: 600,
                        fontSize: '1rem',
                        paddingBottom: 8,
                    },
                },
            },
            MuiDialogContent: {
                styleOverrides: {
                    root: {
                        minHeight: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 28px',
                        justifyContent: 'center',
                        textAlign: 'center',
                    },
                },
            },
            MuiDialogActions: {
                styleOverrides: {
                    root: {
                        padding: '12px 20px 16px',
                        gap: 8,
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' },
                    },
                },
            },
            MuiFab: {
                styleOverrides: {
                    root: {
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    },
                },
            },
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        color: isDark ? '#f1f5f9' : '#111827',
                        '--DataGrid-rowBorderColor': isDark ? '#334155' : '#e5e7eb',
                    },
                    columnHeader: {
                        backgroundColor: isDark ? '#263248' : '#f8fafc',
                        color: isDark ? '#94a3b8' : '#6b7280',
                    },
                    cell: {
                        borderColor: isDark ? '#334155' : '#e5e7eb',
                    },
                    footerContainer: {
                        borderColor: isDark ? '#334155' : '#e5e7eb',
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    },
                    toolbarContainer: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    },
                },
            },
        },
    });
}

// Default light theme (kept for backwards compat)
export default buildTheme('light');
