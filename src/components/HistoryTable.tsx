import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Menu,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

// 测试数据类型
type AniHistoryInfo = {
    id: number;
    title: string;
    updateCount: number;
    updateTime: number;
    isWatched: boolean;
    watchedTime: number;
    platform: string;
};

// 测试数据
const testData: AniHistoryInfo[] = Array.from({ length: 55 }, (_, i) => ({
    id: i + 1,
    title: `动漫 ${i + 1}`,
    updateCount: Math.floor(Math.random() * 24) + 1,
    updateTime: Date.now() - Math.floor(Math.random() * 1000000000),
    isWatched: Math.random() > 0.5,
    watchedTime: Date.now() - Math.floor(Math.random() * 1000000000),
    platform: ['Bilibili', '腾讯', 'Mikanani'][i % 3],
}));

export default function NotionStyleTable() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [open, setOpen] = useState(false);
    const [selectedAni, setSelectedAni] = useState<AniHistoryInfo | null>(null);

    const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});

    const columns = useMemo<ColumnDef<AniHistoryInfo>[]>(
        () => [
            {
                accessorKey: 'title',
                header: '动漫标题',
                cell: (info) => (
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() => {
                            setSelectedAni(info.row.original);
                            setOpen(true);
                        }}
                    >
                        {String(info.getValue())}
                    </Button>
                ),
            },
            {
                accessorKey: 'updateCount',
                header: '集数',
            },
            {
                accessorKey: 'updateTime',
                header: '更新日期',
                cell: (info) => new Date(info.getValue() as number).toLocaleDateString(),
            },
            {
                accessorKey: 'isWatched',
                header: '观看状态',
                cell: (info) => ((info.getValue() as boolean) ? '已观看' : '未观看'),
            },
            {
                accessorKey: 'watchedTime',
                header: '观看时间',
                cell: (info) => new Date(info.getValue() as number).toLocaleString(),
            },
            {
                accessorKey: 'platform',
                header: '播出平台',
            },
        ],
        []
    );

    const filteredData = useMemo(() => {
        let rows = testData;
        Object.entries(filters).forEach(([key, value]) => {
            if (!value) return;
            rows = rows.filter((row) =>
                String(row[key as keyof AniHistoryInfo] ?? '')
                    .toLowerCase()
                    .includes(value.toLowerCase())
            );
        });
        return rows;
    }, [filters]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { pagination: { pageIndex, pageSize } },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const handleOpenMenu = (columnId: string, event: React.MouseEvent<HTMLElement>) => {
        setAnchorEls((prev) => ({ ...prev, [columnId]: event.currentTarget }));
    };

    const handleCloseMenu = (columnId: string) => {
        setAnchorEls((prev) => ({ ...prev, [columnId]: null }));
    };

    const uniqueValues = (key: keyof AniHistoryInfo) =>
        Array.from(new Set(testData.map((d) => String(d[key]))));

    return (
        <Box p={2}>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell
                                        key={header.id}
                                        sx={{ fontWeight: 'bold', position: 'relative' }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleOpenMenu(header.column.id, e)}
                                            >
                                                <FilterListIcon fontSize="small" />
                                            </IconButton>
                                            <Menu
                                                anchorEl={anchorEls[header.column.id]}
                                                open={Boolean(anchorEls[header.column.id])}
                                                onClose={() => handleCloseMenu(header.column.id)}
                                            >
                                                {uniqueValues(header.column.id as keyof AniHistoryInfo).map((val) => (
                                                    <MenuItem
                                                        key={val}
                                                        onClick={() => {
                                                            setFilters((prev) => ({ ...prev, [header.column.id]: val }));
                                                            handleCloseMenu(header.column.id);
                                                        }}
                                                    >
                                                        {val}
                                                    </MenuItem>
                                                ))}
                                                <MenuItem
                                                    onClick={() => {
                                                        setFilters((prev) => ({ ...prev, [header.column.id]: '' }));
                                                        handleCloseMenu(header.column.id);
                                                    }}
                                                >
                                                    清空
                                                </MenuItem>
                                            </Menu>
                                        </Stack>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} hover>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 分页 */}
            <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                    variant="outlined"
                    onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
                    disabled={pageIndex === 0}
                >
                    上一页
                </Button>
                <Typography>
                    {pageIndex + 1} / {totalPages} 页 ({filteredData.length} 条)
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => setPageIndex((old) => Math.min(old + 1, totalPages - 1))}
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
                        {[5, 10, 20, 50].map((size) => (
                            <MenuItem key={size} value={size}>
                                {size}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {/* Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    {selectedAni?.title ?? '番剧详情'}
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <pre>{JSON.stringify(selectedAni, null, 2)}</pre>
                </DialogContent>
            </Dialog>
        </Box>
    );
}