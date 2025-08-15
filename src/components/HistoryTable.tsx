import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,

} from '@tanstack/react-table';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button,
    Menu,
    MenuItem,

} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// ---------------------------
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

// ---------------------------
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

// ---------------------------
// 主组件
export default function TanstackDataGrid() {
    const pageSize = 10;

    const [filters, setFilters] = useState<Record<string, string>>({});
    const [pageIndex, setPageIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [selectedAni, setSelectedAni] = useState<AniHistoryInfo | null>(null);

    // 当前列菜单状态
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuColumn, setMenuColumn] = useState<string | null>(null);

    // ---------------------------
    // 表格列定义
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
                cell: (info) => (info.getValue() ? '已观看' : '未观看'),
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
        getFilteredRowModel: getFilteredRowModel(),
    });

    // ---------------------------
    // 菜单筛选逻辑
    const openMenu = (event: React.MouseEvent<HTMLButtonElement>, columnId: string) => {
        setMenuAnchor(event.currentTarget);
        setMenuColumn(columnId);
    };
    const closeMenu = () => {
        setMenuAnchor(null);
        setMenuColumn(null);
    };
    const selectFilterValue = (value: string) => {
        if (menuColumn) setFilters((prev) => ({ ...prev, [menuColumn]: value }));
        closeMenu();
    };

    // ---------------------------
    // 当前页数据
    const currentPageRows = table.getRowModel().rows;

    // ---------------------------
    return (
        <>
            {/* 表格 */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <React.Fragment key={headerGroup.id}>
                        <tr>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '4px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={(e) => openMenu(e, header.column.id)}
                                        >
                                            筛选
                                        </Button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </React.Fragment>
                ))}
                </thead>
                <tbody>
                {currentPageRows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} style={{ borderBottom: '1px solid #eee', padding: '4px' }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 分页 */}
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button onClick={() => setPageIndex((old) => Math.max(old - 1, 0))} disabled={pageIndex === 0}>
                    上一页
                </Button>
                <span>
          第 {pageIndex + 1} / {Math.ceil(filteredData.length / pageSize)} 页，共 {filteredData.length} 条
        </span>
                <Button
                    onClick={() =>
                        setPageIndex((old) => Math.min(old + 1, Math.ceil(filteredData.length / pageSize) - 1))
                    }
                    disabled={(pageIndex + 1) * pageSize >= filteredData.length}
                >
                    下一页
                </Button>
            </div>

            {/* 菜单筛选 */}
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                {menuColumn && typeof filteredData[0]?.[menuColumn as keyof AniHistoryInfo] === 'boolean' ? (
                    <>
                        <MenuItem onClick={() => selectFilterValue('true')}>已观看</MenuItem>
                        <MenuItem onClick={() => selectFilterValue('false')}>未观看</MenuItem>
                    </>
                ) : (
                    Array.from(
                        new Set(
                            filteredData
                                .map((row) => String(row[menuColumn as keyof AniHistoryInfo]))
                                .filter(Boolean)
                        )
                    ).map((val) => (
                        <MenuItem key={val} onClick={() => selectFilterValue(val)}>
                            {val}
                        </MenuItem>
                    ))
                )}
            </Menu>

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
