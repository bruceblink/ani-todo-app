import Typography from '@mui/material/Typography';
import CustomizedDataGrid from "@/components/CustomizedDataGrid.tsx";


export default function HistoryPage() {
    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                动漫历史数据
            </Typography>
            <CustomizedDataGrid />
        </div>
    )
}