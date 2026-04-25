import Typography from '@mui/material/Typography';
import HistoryDataGrid from "@/components/HistoryDataGrid.tsx";
import { Box } from "@mui/material";
import { History } from "lucide-react";

interface HistoryPageProps {
    searchQuery: string;
}

export default function HistoryPage({ searchQuery }: HistoryPageProps) {
    return (
        <Box
            sx={{
                p: '24px',
                width: '100%',
                maxWidth: '1280px',
                margin: '0 auto',
                boxSizing: 'border-box',
                color: 'text.primary',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: 2 }}>
                <History size={18} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
                <Typography component="h2" variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    观看历史
                </Typography>
            </Box>
            <HistoryDataGrid isServer={false} searchQuery={searchQuery} />
        </Box>
    );
}