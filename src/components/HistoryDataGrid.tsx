import { DataGrid, type GridPaginationModel, type GridFilterModel } from '@mui/x-data-grid';
import { columns } from './data/gridData';
import { useEffect, useMemo, useState } from 'react';
import { useAniHistoryData } from '@/hooks/useAniHistoryData';
import type { AniHistoryInfo } from '@/utils/api';
import { toast } from 'react-hot-toast';

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

    // hook 获取数据
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

    return (
        <DataGrid
            rows={isServer ? data?.items ?? [] : (filteredRows as AniHistoryInfo[])}
            columns={columns}
            loading={loading}
            pagination
            paginationMode={isServer ? 'server' : 'client'}
            rowCount={isServer ? data?.total ?? 0 : filteredRows.length}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            pageSizeOptions={[10, 20, 50]}
            disableColumnResize
            density="compact"
        />
    );
}