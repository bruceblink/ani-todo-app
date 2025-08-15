import {
    DataGrid,
    type GridPaginationModel,
    type GridFilterModel,
    type GridColDef,
    type GridRenderCellParams,
} from '@mui/x-data-grid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAniHistoryData } from '@/hooks/useAniHistoryData';
import type { AniHistoryInfo } from '@/utils/api';
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { columns as baseColumns } from './data/gridData';

type Props = {
    isServer?: boolean; // 是否服务端分页
};

export default function HistoryDataGrid({ isServer = true }: Props) {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 20,
        page: 0,
    });

    // 单列 filterModel，用于 MUI UI 显示
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [{ field: 'title', operator: 'contains', value: '' }],
    });

    // 多列本地筛选条件
    const [localFilters, setLocalFilters] = useState<Record<string, string>>({
        title: '',
        isWatched: '',
        platform: '',
    });

    const [open, setOpen] = useState(false);
    const [selectedAni, setSelectedAni] = useState<AniHistoryInfo | null>(null);
    const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

    const { data, loading, error } = useAniHistoryData(
        paginationModel.page + 1,
        paginationModel.pageSize,
        isServer,
        filterModel
    );

    useEffect(() => {
        if (error) toast.error(`加载番剧历史出错：${error}`);
    }, [error]);

    const filteredRows = useMemo(() => {
        if (isServer) return data?.items ?? [];
        let rows = data?.items ?? [];
        Object.entries(localFilters).forEach(([field, value]) => {
            if (!value) return;
            rows = rows.filter((row) => {
                const cell = row[field as keyof AniHistoryInfo];
                return String(cell ?? '').toLowerCase().includes(value.toLowerCase());
            });
        });
        return rows;
    }, [isServer, data?.items, localFilters]);

    const columns: GridColDef<AniHistoryInfo>[] = useMemo(() => {
        return baseColumns.map((col) =>
            col.field === 'title'
                ? {
                    ...col,
                    renderCell: (params: GridRenderCellParams<AniHistoryInfo, string>) => (
                        <button
                            type="button"
                            ref={triggerButtonRef} // 保存触发按钮的 ref
                            onClick={() => {
                                setSelectedAni(params.row);
                                setOpen(true);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                margin: 0,
                                color: '#1976d2',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                font: 'inherit',
                            }}
                        >
                            {params.value}
                        </button>
                    ),
                }
                : col
        );
    }, []);

    const handleCloseDialog = () => {
        setOpen(false);
        // 关闭 Dialog 后将焦点返回触发按钮
        triggerButtonRef.current?.focus();
    };

    return (
        <>
            {/* 可自定义的多列筛选输入 */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                {['title', 'isWatched', 'platform'].map((field) => (
                    <TextField
                        key={field}
                        label={field}
                        size="small"
                        value={localFilters[field]}
                        onChange={(e) =>
                            setLocalFilters((prev) => ({ ...prev, [field]: e.target.value }))
                        }
                    />
                ))}
            </div>

            <DataGrid
                rows={isServer ? data?.items ?? [] : (filteredRows as AniHistoryInfo[])}
                columns={columns}
                loading={loading}
                pagination
                paginationMode={isServer ? 'server' : 'client'}
                //rowCount={isServer ? data?.total ?? 0 : filteredRows.length}
                rowCount={isServer ? data?.total ?? 0 : undefined} // 只在服务端分页时传
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                pageSizeOptions={[10, 20, 50]}
                disableColumnResize
                density="compact"
            />

            <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>
                    {selectedAni?.title ?? '番剧详情'}
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>

                </DialogContent>
            </Dialog>
        </>
    );
}
