import {
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
} from "@mui/material";

interface PaginationProps {
    pageIndex: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    pageSizeOptions: number[];
    setPageIndex: (v: number) => void;
    setPageSize: (v: number) => void;
}

export default function Pagination({
                                       pageIndex,
                                       totalPages,
                                       totalCount,
                                       pageSize,
                                       pageSizeOptions,
                                       setPageIndex,
                                       setPageSize,
                                   }: PaginationProps) {
    return (
        <Stack direction="row" alignItems="center" spacing={2}>
            <Button
                variant="outlined"
                onClick={() => setPageIndex(Math.max(pageIndex - 1, 0))}
                disabled={pageIndex === 0}
            >
                上一页
            </Button>
            <Typography>
                {pageIndex + 1} / {totalPages} 页 ({totalCount} 条)
            </Typography>
            <Button
                variant="outlined"
                onClick={() => setPageIndex(Math.min(pageIndex + 1, totalPages - 1))}
                disabled={pageIndex + 1 >= totalPages}
            >
                下一页
            </Button>

            <FormControl size="small" variant="standard">
                <InputLabel>每页条数</InputLabel>
                <Select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPageIndex(0);
                    }}
                >
                    {pageSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                            {size}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    );
}
