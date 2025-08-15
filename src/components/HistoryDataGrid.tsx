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
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
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

    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [
            { field: 'title', operator: 'contains', value: '' },
            { field: 'isWatched', operator: 'equals', value: '' },
            { field: 'platform', operator: 'contains', value: '' },
        ],
    });

    const [open, setOpen] = useState(false);
    const [selectedAni, setSelectedAni] = useState<AniHistoryInfo | null>(null);
    const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

    const { data, loading, error } = useAniHistoryData(
        paginationModel.page + 1,
        paginationModel.pageSize,
        isServer,
        filterModel // 传给后端做服务端筛选
    );

    useEffect(() => {
        if (error) {
            toast.error(`加载番剧历史出错：${error}`);
        }
    }, [error]);

    // 本地模式下多列筛选
    const filteredRows = useMemo(() => {
        if (isServer) return data?.items ?? [];
        let rows = data?.items ?? [];
        filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || !value) return; // 没值不筛选
            rows = rows.filter((row) => {
                const cell = (row as unknown as Record<string, string | number | boolean>)[field];
                switch (operator) {
                    case 'contains':
                        return String(cell ?? '').toLowerCase().includes(String(value).toLowerCase());
                    case 'equals':
                    case '=':
                        return String(cell ?? '') === String(value);
                    case '>':
                        return Number(cell) > Number(value);
                    case '<':
                        return Number(cell) < Number(value);
                    case 'isEmpty':
                        return cell == null || cell === '';
                    default:
                        return true;
                }
            });
        });
        return rows;
    }, [isServer, data?.items, filterModel]);

    // columns 渲染 title 为可点击按钮
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

            <DataGrid
                rows={isServer ? data?.items ?? [] : (filteredRows as AniHistoryInfo[])}
                columns={columns}
                loading={loading}
                pagination
                paginationMode={isServer ? 'server' : 'client'}
                rowCount={isServer ? data?.total ?? 0 : undefined}
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