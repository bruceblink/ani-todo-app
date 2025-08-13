import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';
import { columns } from './data/gridData';
import { useEffect, useState } from 'react';
import { useAniHistoryData } from '@/hooks/useAniHistoryData';
import type { AniHistoryInfo } from '@/utils/api';
import { toast } from 'react-hot-toast';

type Props = {
    isServer?: boolean; // 新增
};

export default function CustomizedDataGrid({ isServer = true }: Props) {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 20,
        page: 0,
    });

    const { data, loading, error } = useAniHistoryData(
        paginationModel.page + 1,
        paginationModel.pageSize,
        isServer
    );

    useEffect(() => {
        if (error) {
            toast.error(`加载番剧历史出错：${error}`);
        }
    }, [error]);

    return (
        <DataGrid
            rows={(data?.items ?? []) as AniHistoryInfo[]}
            columns={columns}
            loading={loading}
            pagination
            paginationMode={isServer ? 'server' : 'client'} // 自动切换
            rowCount={data?.total ?? 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            disableColumnResize
            density="compact"
        />
    );
}