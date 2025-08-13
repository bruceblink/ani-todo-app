import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';
import { columns } from './data/gridData';
import { useEffect, useState } from 'react';
import { useAniHistoryData } from '@/hooks/useAniHistoryData'; // 根据你的路径调整
import type { AniHistoryInfo } from '@/utils/api';
import {toast} from "react-hot-toast";

export default function CustomizedDataGrid() {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 20,
        page: 0,
    });

    // 注意：hook 接受的是后端的 page（从 1 开始），因此传 paginationModel.page + 1
    const { data, loading, error } = useAniHistoryData(
        paginationModel.page + 1,
        paginationModel.pageSize
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
            paginationMode="server"
            rowCount={data?.total ?? 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            disableColumnResize
            density="compact"
        />
    );
}