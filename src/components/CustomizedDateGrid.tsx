import React, { useMemo, useState, useEffect } from 'react';
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

const FilterMenu = React.memo(function FilterMenu({
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
});

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

export default function CustomizedDataGrid<T extends Record<string, unknown>>({
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

    // 把根据 filters 筛选数据的计算用 useMemo 包裹，避免每次渲染都创建新数组
    const filteredData = useMemo(() => {
        return rows.filter(row => {
            return Object.entries(filters).every(([key, valSet]) => {
                if (!valSet || valSet.size === 0) return true;
                return valSet.has(String(row[key as keyof T]));
            });
        });
    }, [rows, filters]);

    // 当 filteredData 或 pageSize 改变时重置页码为 0（避免页码超出范围并触发表格内部 reset 导致循环）
    const filtersKey = JSON.stringify(filters);
    useEffect(() => {
        setPageIndex(0);
    }, [filtersKey, pageSize]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { pagination: { pageIndex, pageSize }, sorting },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
    });

    const totalPages = Math.max(1, Math.ceil(table.getRowModel().rows.length / pageSize));

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
        if (current.size === allVals.length) {
            setFilters(prev => ({ ...prev, [columnId]: new Set() }));
        } else {
            setFilters(prev => ({ ...prev, [columnId]: new Set(allVals) }));
        }
    };

    // 打开菜单（只在需要时 setState）
    const handleOpenMenu = (columnId: string, el: HTMLElement) => {
        setAnchorEls(prev => {
            if (prev[columnId] === el) return prev;
            return { ...prev, [columnId]: el };
        });
    };

    // 关闭菜单（如果已为 null 就不 set）
    const handleCloseMenu = (columnId: string) => {
        setAnchorEls(prev => {
            if (!prev[columnId]) return prev;
            return { ...prev, [columnId]: null };
        });
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

                                                <IconButton size="small" onClick={e => handleOpenMenu(header.column.id, e.currentTarget)}>
                                                    <FilterListIcon fontSize="small" />
                                                    {filters[header.column.id]?.size ? (
                                                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                            {filters[header.column.id].size}
                                                        </Typography>
                                                    ) : null}
                                                </IconButton>

                                                <FilterMenu
                                                    anchorEl={anchorEls[header.column.id] ?? null}
                                                    open={Boolean(anchorEls[header.column.id])}
                                                    onClose={() => handleCloseMenu(header.column.id)}
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
