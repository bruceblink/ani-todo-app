import Typography from '@mui/material/Typography';
import HistoryDataGrid from "@/components/HistoryDataGrid.tsx";
import {Box} from "@mui/material";


export default function HistoryPage() {
    return (
        <Box
            sx={{
                p: 3,
                textAlign: 'center',
                width: '100%',
                maxWidth: '1280px',
                margin: '0 auto',
                boxSizing: 'border-box',
            }}
        >
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                历史记录
            </Typography>
            <HistoryDataGrid isServer={false} />
        </Box>
    )
}