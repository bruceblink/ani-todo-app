import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    Select,
    FormControl,
    InputLabel,
    Button,
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

export default function TanstackDataGridWithColumnFilter() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [open, setOpen] = useState(false);
    const [selectedAni, setSelectedAni] = useState<AniHistoryInfo | null>(null);

    // 每列筛选状态
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

    // 当前打开筛选菜单列
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentColumnId, setCurrentColumnId] = useState<string | null>(null);

    const handleOpenFilterMenu = (event: React.MouseEvent<HTMLElement>, columnId: string) => {
        setAnchorEl(event.currentTarget);
        setCurrentColumnId(columnId);
    };
    const handleCloseFilterMenu = () => {
        setAnchorEl(null);
        setCurrentColumnId(null);
    };

    const columns = useMemo<ColumnDef<AniHistoryInfo>[]>(
        () => [
            {
                accessorKey: 'title',
                header: ({ column }) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>动漫标题</span>
                        <IconButton size="small" onClick={(e) => handleOpenFilterMenu(e, column.id)}>
                            <FilterListIcon />
                        </IconButton>
                    </div>
                ),
                cell: (info) => (
                    <Button
                        variant="text"
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
                header: ({ column }) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>集数</span>
                        <IconButton size="small" onClick={(e) => handleOpenFilterMenu(e, column.id)}>
                            <FilterListIcon />
                        </IconButton>
                    </div>
                ),
            },
            {
                accessorKey: 'updateTime',
                header: ({ column }) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>更新日期</span>
                        <IconButton size="small" onClick={(e) => handleOpenFilterMenu(e, column.id)}>
                            <FilterListIcon />
                        </IconButton>
                    </div>
                ),
                cell: (info) => new Date(info.getValue() as number).toLocaleDateString(),
            },
            {
                accessorKey: 'isWatched',
                header: ({ column }) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>观看状态</span>
                        <IconButton size="small" onClick={(e) => handleOpenFilterMenu(e, column.id)}>
                            <FilterListIcon />
                        </IconButton>
                    </div>
                ),
                cell: (info) => ((info.getValue() as boolean) ? '已观看' : '未观看'),
            },
            {
                accessorKey: 'watchedTime',
                header: ({ column }) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>观看时间</span>
                        <IconButton size="small" onClick={(e) => handleOpenFilterMenu(e, column.id)}>
                            <FilterListIcon />
                        </IconButton>
                    </div>
                ),
                cell: (info) => new Date(info.getValue() as number).toLocaleString(),
            },
            {
                accessorKey: 'platform',
                header: ({ column }) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>播出平台</span>
                        <IconButton size="small" onClick={(e) => handleOpenFilterMenu(e, column.id)}>
                            <FilterListIcon />
                        </IconButton>
                    </div>
                ),
            },
        ],
        []
    );

    // 根据列筛选过滤数据
    const filteredData = useMemo(() => {
        let rows = testData;
        Object.entries(columnFilters).forEach(([key, value]) => {
            if (!value) return;
            rows = rows.filter((row) =>
                String(row[key as keyof AniHistoryInfo] ?? '')
                    .toLowerCase()
                    .includes(value.toLowerCase())
            );
        });
        return rows;
    }, [columnFilters]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { pagination: { pageIndex, pageSize } },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id} style={{ borderBottom: '1px solid #ddd', padding: 4 }}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} style={{ borderBottom: '1px solid #eee', padding: 4 }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 分页控制 */}
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button onClick={() => setPageIndex((old) => Math.max(old - 1, 0))} disabled={pageIndex === 0}>
                    上一页
                </Button>
                <span>
                    Page {pageIndex + 1} of {Math.ceil(filteredData.length / pageSize)}
                </span>
                <Button
                    onClick={() =>
                        setPageIndex((old) => (old + 1 < Math.ceil(filteredData.length / pageSize) ? old + 1 : old))
                    }
                    disabled={pageIndex + 1 >= Math.ceil(filteredData.length / pageSize)}
                >
                    下一页
                </Button>
                <FormControl size="small">
                    <InputLabel>每页条数</InputLabel>
                    <Select
                        native
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        label="每页条数"
                    >
                        {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {/* 列筛选菜单 */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseFilterMenu}>
                <MenuItem>
                    <TextField
                        label="Filter"
                        size="small"
                        value={currentColumnId ? columnFilters[currentColumnId] ?? '' : ''}
                        onChange={(e) =>
                            currentColumnId &&
                            setColumnFilters((prev) => ({ ...prev, [currentColumnId]: e.target.value }))
                        }
                    />
                </MenuItem>
            </Menu>

            {/* 点击标题 Dialog */}
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
        </>
    );
}
