import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
    const pageSize = 10;

    const [pageIndex, setPageIndex] = useState(0);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [open, setOpen] = useState(false);
    const [selectedAni, setSelectedAni] = useState<AniHistoryInfo | null>(null);

    // 控制每列筛选菜单
    const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});

    const columns = useMemo<ColumnDef<AniHistoryInfo>[]>(
        () => [
            {
                accessorKey: 'title',
                header: '动漫标题',
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

    // ---------------------------
    // 多列筛选
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

    // ---------------------------
    // 创建表格实例
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
        <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    textAlign: 'left',
                                    padding: '4px',
                                    position: 'relative',
                                }}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                <Button
                                    size="small"
                                    onClick={(e) => handleOpenMenu(header.column.id, e)}
                                    style={{ marginLeft: 8 }}
                                >
                                    筛选
                                </Button>
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
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <td
                                key={cell.id}
                                style={{ borderBottom: '1px solid #eee', padding: '4px' }}
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 分页 */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button onClick={() => setPageIndex((old) => Math.max(old - 1, 0))} disabled={pageIndex === 0}>
                    上一页
                </Button>
                <span>
          {pageIndex + 1} / {totalPages} 页
        </span>
                <Button
                    onClick={() => setPageIndex((old) => Math.min(old + 1, totalPages - 1))}
                    disabled={pageIndex + 1 >= totalPages}
                >
                    下一页
                </Button>
            </div>

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
        </>
    );
}