import { useMemo, useState } from 'react';
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

// --------------------- 类型定义 ---------------------
export type AniHistoryInfo = {
    id: number;
    title: string;
    updateCount: number;
    updateTime: number;
    isWatched: boolean;
    watchedTime: number;
    platform: string;
};

// --------------------- FilterMenu ---------------------
interface FilterMenuProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    values: string[];
    selectedValues: Set<string>;
    onToggleValue: (value: string) => void;
    onToggleAll: () => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
}

function FilterMenu({
                        anchorEl,
                        open,
                        onClose,
                        values,
                        selectedValues,
                        onToggleValue,
                        onToggleAll,
                        searchValue,
                        onSearchChange,
                    }: FilterMenuProps) {
    const allSelected = selectedValues.size === values.length && values.length > 0;
    const indeterminate = selectedValues.size > 0 && selectedValues.size < values.length;

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            slotProps={{ paper: { sx: { width: 220, p: 1 } } }}
        >
            <TextField
                size="small"
                placeholder="搜索..."
                fullWidth
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                sx={{ mb: 1 }}
            />

            <FormControlLabel
                label="全选"
                control={<Checkbox checked={allSelected} indeterminate={indeterminate} onChange={onToggleAll} />}
                sx={{ width: '100%', m: 0 }}
            />

            <Divider sx={{ my: 1 }} />

            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {values
                    .filter(v => v.includes(searchValue))
                    .map(v => (
                        <MenuItem key={v} disableGutters>
                            <FormControlLabel
                                control={<Checkbox checked={selectedValues.has(v)} onChange={() => onToggleValue(v)} />}
                                label={v}
                                sx={{ width: '100%', m: 0 }}
                            />
                        </MenuItem>
                    ))}
            </Box>

            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ px: 1 }}>
                已选 {selectedValues.size} 项
            </Typography>
        </Menu>
    );
}

// --------------------- DetailDialog ---------------------
interface DetailDialogProps<T extends { title?: string }> {
    open: boolean;
    onClose: () => void;
    rowData: T | null;
}

function DetailDialog<T extends { title?: string }>({ open, onClose, rowData }: DetailDialogProps<T>) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {rowData?.title ?? '详情'}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <pre>{JSON.stringify(rowData, null, 2)}</pre>
            </DialogContent>
        </Dialog>
    );
}

// --------------------- DataGrid ---------------------
interface DataGridProps<T extends Record<string, unknown>> {
    rows: T[];
    columns: ColumnDef<T>[];
    pageSizeOptions?: number[];
    initialPageSize?: number;
    onRowClick?: (row: T) => void;
}

export function DataGrid<T extends Record<string, unknown>>({
                                                                rows,
                                                                columns,
                                                                pageSizeOptions = [5, 10, 20, 50],
                                                                initialPageSize = 10,
                                                                onRowClick,
                                                            }: DataGridProps<T>) {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [filters, setFilters] = useState<Record<string, Set<string>>>({});
    const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
    const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});
    const [selectedRow, setSelectedRow] = useState<T | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const table = useReactTable({
        data: rows.filter(row => {
            return Object.entries(filters).every(([key, valSet]) => {
                if (!valSet || valSet.size === 0) return true;
                return valSet.has(String(row[key as keyof T]));
            });
        }),
        columns,
        state: { pagination: { pageIndex, pageSize }, sorting },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
    });

    const totalPages = Math.ceil(table.getRowModel().rows.length / pageSize);

    const uniqueValues = (key: keyof T) => Array.from(new Set(rows.map(r => String(r[key]))));

    const handleToggleFilter = (columnId: string, value: string) => {
        setFilters(prev => {
            const newSet = new Set(prev[columnId] ?? []);
            if (newSet.has(value)) newSet.delete(value);
            else newSet.add(value);
            return { ...prev, [columnId]: newSet };
        });
    };

    const handleToggleAll = (columnId: string) => {
        const allVals = uniqueValues(columnId as keyof T);
        const current = filters[columnId] ?? new Set<string>();
        if (current.size === allVals.length) setFilters(prev => ({ ...prev, [columnId]: new Set() }));
        else setFilters(prev => ({ ...prev, [columnId]: new Set(allVals) }));
    };

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
                                                <IconButton size="small" onClick={() => {
                                                    const s = sorting.find(s => s.id === header.column.id);
                                                    if (!s) setSorting([{ id: header.column.id, desc: false }]);
                                                    else if (!s.desc) setSorting([{ id: header.column.id, desc: true }]);
                                                    else setSorting([]);
                                                }}>
                                                    {sorting.find(s => s.id === header.column.id)?.desc
                                                        ? <ArrowDownwardIcon fontSize="small" />
                                                        : sorting.find(s => s.id === header.column.id)
                                                            ? <ArrowUpwardIcon fontSize="small" />
                                                            : <ArrowUpwardIcon fontSize="small" sx={{ opacity: 0.3 }} />}
                                                </IconButton>

                                                <IconButton size="small" onClick={e => setAnchorEls(prev => ({ ...prev, [header.column.id]: e.currentTarget }))}>
                                                    <FilterListIcon fontSize="small" />
                                                    {filters[header.column.id]?.size ? (
                                                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                            {filters[header.column.id].size}
                                                        </Typography>
                                                    ) : null}
                                                </IconButton>

                                                <FilterMenu
                                                    anchorEl={anchorEls[header.column.id]}
                                                    open={Boolean(anchorEls[header.column.id])}
                                                    onClose={() => setAnchorEls(prev => ({ ...prev, [header.column.id]: null }))}
                                                    values={uniqueValues(header.column.id as keyof T)}
                                                    selectedValues={filters[header.column.id] ?? new Set()}
                                                    onToggleValue={v => handleToggleFilter(header.column.id, v)}
                                                    onToggleAll={() => handleToggleAll(header.column.id)}
                                                    searchValue={filterSearch[header.column.id] ?? ''}
                                                    onSearchChange={v => setFilterSearch(prev => ({ ...prev, [header.column.id]: v }))}
                                                />
                                            </Stack>
                                        </Stack>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>

                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow
                                key={row.id}
                                hover
                                onClick={() => {
                                    setSelectedRow(row.original);
                                    setDialogOpen(true);
                                    onRowClick?.(row.original);
                                }}
                            >
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
                <Button variant="outlined" onClick={() => setPageIndex(Math.max(pageIndex - 1, 0))} disabled={pageIndex === 0}>
                    上一页
                </Button>
                <Typography>{pageIndex + 1} / {totalPages} 页 ({table.getRowModel().rows.length} 条)</Typography>
                <Button variant="outlined" onClick={() => setPageIndex(Math.min(pageIndex + 1, totalPages - 1))} disabled={pageIndex + 1 >= totalPages}>
                    下一页
                </Button>

                <FormControl size="small" variant="standard">
                    <InputLabel>每页条数</InputLabel>
                    <Select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPageIndex(0); }}>
                        {pageSizeOptions.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>

            <DetailDialog open={dialogOpen} onClose={() => setDialogOpen(false)} rowData={selectedRow} />
        </Box>
    );
}

// --------------------- 测试用例 ---------------------
const testData: AniHistoryInfo[] = Array.from({ length: 55 }, (_, i) => ({
    id: i + 1,
    title: `动漫 ${i + 1}`,
    updateCount: Math.floor(Math.random() * 24) + 1,
    updateTime: Date.now() - Math.floor(Math.random() * 1000000000),
    isWatched: Math.random() > 0.5,
    watchedTime: Date.now() - Math.floor(Math.random() * 1000000000),
    platform: ['Bilibili', '腾讯', 'Mikanani'][i % 3],
}));

export default function Apps() {
    const columns: ColumnDef<AniHistoryInfo>[] = useMemo(() => [
        { accessorKey: 'title', header: '动漫标题', cell: info => info.getValue() },
        { accessorKey: 'updateCount', header: '集数' },
        { accessorKey: 'updateTime', header: '更新日期', cell: info => new Date(info.getValue() as number).toLocaleDateString() },
        { accessorKey: 'isWatched', header: '观看状态', cell: info => info.getValue() ? '已观看' : '未观看' },
        { accessorKey: 'watchedTime', header: '观看时间', cell: info => new Date(info.getValue() as number).toLocaleString() },
        { accessorKey: 'platform', header: '播出平台' },
    ], []);

    return <DataGrid rows={testData} columns={columns} />;
}
