// theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiDialog: {
            defaultProps: {
                // 默认开启 fullWidth 限制
                fullWidth: true,
                maxWidth: 'sm', // xs | sm | md | lg | xl
            },
            styleOverrides: {
                paper: {
                    borderRadius: '12px',
                    width: '384px',
                    height: '237.3px',
                    minHeight: '180px',
                    maxWidth: '90vw',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                },
            },
        },
    },
});

export default theme;
