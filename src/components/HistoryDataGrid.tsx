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
import {formatUnixMs2Date} from "@/utils/utils.ts";
import {useWatchedAni} from "@/hooks/useWatchedAni.ts";
import {useFavoriteAni} from "@/hooks/useFavoriteAni.ts";
import AniItem from "@/components/AniItem.tsx";

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

    const { data, loading, error, refresh } = useAniHistoryData(
        paginationModel.page + 1,
        paginationModel.pageSize,
        isServer,
        filterModel,
    );

    const { handleWatch } = useWatchedAni();
    const { handleFavor, favoriteAniItems } = useFavoriteAni();

    useEffect(() => {
        if (error) {
            toast.error(`加载番剧历史出错：${error}`);
        }
    }, [error]);

    const filteredRows = useMemo(() => {
        if (isServer) return data?.items ?? [];
        let rows = data?.items ?? [];
        filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || !value) return;
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

    const columns: GridColDef<AniHistoryInfo>[] = useMemo(() => {
        return baseColumns.map((col) =>
            col.field === 'title'
                ? {
                    ...col,
                    renderCell: (params: GridRenderCellParams<AniHistoryInfo, string>) => (
                        <button
                            type="button"
                            ref={triggerButtonRef}
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
        triggerButtonRef.current?.focus();
    };

    const handleClearAndRefresh = async (id: number) => {
        handleWatch(id);       // 执行清除逻辑
        handleCloseDialog();   // 关闭 Dialog
        await refresh();       // 重新加载数据
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

            <Dialog
                open={open}
                onClose={handleCloseDialog}
                maxWidth={false}
                slotProps={{
                    paper: {
                        sx: {
                            width: 450,
                            maxWidth: 900,
                            minWidth: 450,
                            height: 350,
                            maxHeight: 700,
                            minHeight: 350,
                        },
                    },
                }}
            >
                <DialogTitle>
                    番剧详情
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <AniItem
                        ani={{
                            id: selectedAni?.id ?? 0,
                            title: selectedAni?.title ?? '',
                            update_count: selectedAni?.updateCount ?? '',
                            detail_url: selectedAni?.detailUrl ?? '',
                            image_url: selectedAni?.imageUrl ?? '',
                            update_time: selectedAni?.updateTime ?? 0,
                            update_info: selectedAni?.updateInfo ?? '',
                            update_time_str: formatUnixMs2Date(selectedAni?.updateTime ?? 0) ?? '',
                            platform: selectedAni?.platform ?? '',
                        }}
                        onClear={handleClearAndRefresh}
                        isFavorite={favoriteAniItems.has(selectedAni?.title ?? '')}
                        onToggleFavorite={handleFavor}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}