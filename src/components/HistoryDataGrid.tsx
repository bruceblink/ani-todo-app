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
import { api } from '@/utils/api';
import { toast } from 'react-hot-toast';
import { columns as baseColumns } from './data/gridData';
import { formatUnixMs2Date, fuzzySearch } from "@/utils/utils.ts";
import { useWatchedAni } from "@/hooks/useWatchedAni.ts";
import { useFavoriteAni } from "@/hooks/useFavoriteAni.ts";
import AniItem from "@/components/AniItem.tsx";
import { Trash2, Trash } from 'lucide-react';
import {
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Button,
} from "@mui/material";

type Props = {
    isServer?: boolean;
    searchQuery: string;
};


export default function HistoryDataGrid({ isServer = true, searchQuery }: Props) {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 20,
        page: 0,
    });

    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [
            { id: 'title', field: 'title', operator: 'contains', value: '' },
            { id: 'isWatched', field: 'isWatched', operator: 'equals', value: '' },
            { id: 'platform', field: 'platform', operator: 'contains', value: '' },
        ],
    });

    const [open, setOpen] = useState(false);
    const [selectedAni, setSelectedAni] = useState<AniHistoryInfo | null>(null);
    const [clearAllOpen, setClearAllOpen] = useState(false);
    const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

    // 自动同步 searchQuery 到 filterModel（服务端模式下）
    useEffect(() => {
        if (isServer) {
            setFilterModel((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                    item.field === "title"
                        ? { ...item, value: searchQuery }
                        : item
                ),
            }));
        }
    }, [isServer, searchQuery]);

    const { data, loading, error, refresh } = useAniHistoryData(
        paginationModel.page + 1,
        paginationModel.pageSize,
        isServer,
        filterModel
    );

    const { handleWatch } = useWatchedAni();
    const { handleFavor, favoriteAniItems } = useFavoriteAni();

    useEffect(() => {
        if (error) {
            toast.error(`加载番剧历史出错：${error}`);
        }
    }, [error]);

    // 本地模式下多列筛选 + searchQuery
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

        rows = fuzzySearch(rows, searchQuery, ['title', 'platform'])
        return rows;
    }, [isServer, data?.items, filterModel, searchQuery]);

    const handleDeleteRow = async (id: number, title: string) => {
        try {
            await api.deleteWatchRecord(id);
            toast.success(`已删除《${title}》的观看记录`);
            await refresh();
        } catch (e) {
            toast.error(`删除失败：${e}`);
        }
    };

    const handleClearAll = async () => {
        try {
            await api.clearAllWatchHistory();
            toast.success('已清空所有观看历史');
            setClearAllOpen(false);
            await refresh();
        } catch (e) {
            toast.error(`清空失败：${e}`);
        }
    };

    const columns: GridColDef<AniHistoryInfo>[] = useMemo(() => {
        const cols = baseColumns.map((col) =>
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

        cols.push({
            field: '_actions',
            headerName: '',
            width: 56,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams<AniHistoryInfo>) => (
                <button
                    title="删除此记录"
                    onClick={() => handleDeleteRow(params.row.id, params.row.title)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        borderRadius: 4,
                        transition: 'color 0.15s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.color = 'var(--color-error, #ef4444)')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                    <Trash2 size={15} strokeWidth={2} />
                </button>
            ),
        });

        return cols;
    }, []);

    const handleCloseDialog = () => {
        setOpen(false);
        triggerButtonRef.current?.focus();
    };

    const handleClearAndRefresh = async (id: number, title: string) => {
        handleWatch(id, title);
        handleCloseDialog();
        await refresh();
    };

    const total = isServer ? (data?.total ?? 0) : filteredRows.length;

    return (
        <>
            {/* Toolbar: clear-all button */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '8px 0 8px',
            }}>
                <button
                    onClick={() => setClearAllOpen(true)}
                    disabled={total === 0}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        borderRadius: 8,
                        background: total === 0 ? 'var(--bg-base)' : 'var(--color-error, #ef4444)',
                        color: total === 0 ? 'var(--text-muted)' : '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: '1px solid var(--border-color)',
                        cursor: total === 0 ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.15s ease',
                        whiteSpace: 'nowrap',
                        opacity: total === 0 ? 0.5 : 1,
                    }}
                    onMouseOver={e => { if (total > 0) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseOut={e => { if (total > 0) e.currentTarget.style.opacity = '1'; }}
                >
                    <Trash size={13} strokeWidth={2.5} />
                    清空历史
                </button>
            </div>

            <div
                key={loading ? 'loading' : 'loaded'}
                style={loading ? undefined : {
                    animation: 'fadeInUp 0.38s ease-out forwards',
                    animationDelay: '0.08s',
                    opacity: 0,
                }}
            >
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
            </div>

            {/* AniItem detail dialog */}
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1300,
                        backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                    onClick={handleCloseDialog}
                >
                    <div key={selectedAni?.id ?? 0}
                         onClick={(e) => e.stopPropagation()}
                         style={{
                             width: 'calc(clamp(480px, calc(90vw/4 - 24px), 360px) * 0.8)',
                             height: 'calc(calc(clamp(480px, calc(90vw/4 - 24px), 360px) * 0.618) * 0.8)',
                             flexShrink: 0,
                         }}>
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
                    </div>
                </div>
            )}

            {/* Clear-all confirmation dialog */}
            <Dialog open={clearAllOpen} onClose={() => setClearAllOpen(false)}>
                <DialogTitle>清空观看历史</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        确定要清空所有观看历史记录吗？此操作不可撤销。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearAllOpen(false)} sx={{ color: 'text.secondary' }}>
                        取消
                    </Button>
                    <Button onClick={handleClearAll} variant="contained" color="error">
                        确认清空
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
