import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
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
    Checkbox,
    FormControlLabel,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Stack,
    Divider,
    TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// 数据类型
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
    const [filters, setFilters] = useState<Record<string, Set<string>>>({});
    const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const [open, setOpen] = useState(false);
    const [selectedAni, setSelectedAni] = useState<AniHistoryInfo | null>(null);
    const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});

    const columns = useMemo<ColumnDef<AniHistoryInfo>[]>(() => [
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
        { accessorKey: 'updateCount', header: '集数' },
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
        { accessorKey: 'platform', header: '播出平台' },
    ], []);

    const filteredData = useMemo(() => {
        let rows = testData;
        Object.entries(filters).forEach(([key, valueSet]) => {
            if (!valueSet || valueSet.size === 0) return;
            rows = rows.filter(row => valueSet.has(String(row[key as keyof AniHistoryInfo])));
        });
        return rows;
    }, [filters]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { pagination: { pageIndex, pageSize }, sorting },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
    });

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const handleOpenMenu = (columnId: string, event: React.MouseEvent<HTMLElement>) => {
        setAnchorEls(prev => ({ ...prev, [columnId]: event.currentTarget }));
    };

    const handleCloseMenu = (columnId: string) => {
        setAnchorEls(prev => ({ ...prev, [columnId]: null }));
        setFilterSearch(prev => ({ ...prev, [columnId]: '' }));
    };

    const uniqueValues = (key: keyof AniHistoryInfo) =>
        Array.from(new Set(testData.map(d => String(d[key]))));

    const toggleSort = (columnId: string) => {
        const existing = sorting.find(s => s.id === columnId);
        if (!existing) setSorting([{ id: columnId, desc: false }]);
        else if (existing && !existing.desc) setSorting([{ id: columnId, desc: true }]);
        else setSorting([]);
    };

    const handleToggleFilter = (columnId: string, value: string) => {
        setFilters(prev => {
            const prevSet = prev[columnId] ?? new Set<string>();
            const newSet = new Set(prevSet);
            if (newSet.has(value)) newSet.delete(value);
            else newSet.add(value);
            return { ...prev, [columnId]: newSet };
        });
    };

    const handleClearFilter = (columnId: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[columnId];
            return newFilters;
        });
        handleCloseMenu(columnId);
    };

    const handleToggleAllCheckbox = (columnId: string) => {
        const allValues = uniqueValues(columnId as keyof AniHistoryInfo);
        const currentSet = filters[columnId] ?? new Set<string>();
        if (currentSet.size === allValues.length) {
            // 已全选 -> 取消全选
            setFilters(prev => ({ ...prev, [columnId]: new Set() }));
        } else {
            // 全选
            setFilters(prev => ({ ...prev, [columnId]: new Set(allValues) }));
        }
    };

    const countSelected = (columnId: string) => filters[columnId]?.size ?? 0;

    return (
        <Box p={2}>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                    <TableHead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableCell key={header.id} sx={{ fontWeight: 'bold', position: 'relative' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => toggleSort(header.column.id)}
                                                >
                                                    {sorting.find(s => s.id === header.column.id)?.desc
                                                        ? <ArrowDownwardIcon fontSize="small" />
                                                        : sorting.find(s => s.id === header.column.id)
                                                            ? <ArrowUpwardIcon fontSize="small" />
                                                            : <ArrowUpwardIcon fontSize="small" sx={{ opacity: 0.3 }} />}
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenMenu(header.column.id, e)}
                                                >
                                                    <FilterListIcon fontSize="small" />
                                                    {countSelected(header.column.id) > 0 && (
                                                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                            {countSelected(header.column.id)}
                                                        </Typography>
                                                    )}
                                                </IconButton>
                                            </Stack>

                                            <Menu
                                                anchorEl={anchorEls[header.column.id]}
                                                open={Boolean(anchorEls[header.column.id])}
                                                onClose={() => handleCloseMenu(header.column.id)}
                                                slotProps={{
                                                    paper: {
                                                        sx: { maxHeight: 350, minWidth: 200, p: 1 }
                                                    }
                                                }}
                                            >
                                                {/* 搜索框 */}
                                                <TextField
                                                    size="small"
                                                    placeholder="搜索..."
                                                    fullWidth
                                                    value={filterSearch[header.column.id] ?? ''}
                                                    onChange={e => setFilterSearch(prev => ({
                                                        ...prev,
                                                        [header.column.id]: e.target.value
                                                    }))}
                                                    sx={{ mb: 1 }}
                                                />

                                                {/* 全选checkbox */}
                                                <FormControlLabel
                                                    label="全选"
                                                    control={
                                                        <Checkbox
                                                            checked={
                                                                countSelected(header.column.id) === uniqueValues(header.column.id as keyof AniHistoryInfo).length &&
                                                                uniqueValues(header.column.id as keyof AniHistoryInfo).length > 0
                                                            }
                                                            indeterminate={
                                                                countSelected(header.column.id) > 0 &&
                                                                countSelected(header.column.id) < uniqueValues(header.column.id as keyof AniHistoryInfo).length
                                                            }
                                                            onChange={() => handleToggleAllCheckbox(header.column.id)}
                                                        />
                                                    }
                                                    sx={{ mb: 1 }}
                                                />

                                                <Divider sx={{ mb: 1 }} />

                                                {/* 复选框列表 */}
                                                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                                    {uniqueValues(header.column.id as keyof AniHistoryInfo)
                                                        .filter(val => val.includes(filterSearch[header.column.id] ?? ''))
                                                        .map(val => (
                                                            <MenuItem key={val}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={filters[header.column.id]?.has(val) ?? false}
                                                                            onChange={() => handleToggleFilter(header.column.id, val)}
                                                                        />
                                                                    }
                                                                    label={val}
                                                                />
                                                            </MenuItem>
                                                        ))}
                                                </Box>

                                                <Divider sx={{ mt: 1 }} />
                                                <MenuItem onClick={() => handleClearFilter(header.column.id)}>
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
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} hover>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                    variant="outlined"
                    onClick={() => setPageIndex(old => Math.max(old - 1, 0))}
                    disabled={pageIndex === 0}
                >
                    上一页
                </Button>
                <Typography>
                    {pageIndex + 1} / {totalPages} 页 ({filteredData.length} 条)
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => setPageIndex(old => Math.min(old + 1, totalPages - 1))}
                    disabled={pageIndex + 1 >= totalPages}
                >
                    下一页
                </Button>
                <FormControl size="small" variant="standard">
                    <InputLabel>每页条数</InputLabel>
                    <Select
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value));
                            setPageIndex(0);
                        }}
                    >
                        {[5, 10, 20, 50].map(size => (
                            <MenuItem key={size} value={size}>{size}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

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