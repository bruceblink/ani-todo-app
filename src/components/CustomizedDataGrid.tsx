import {DataGrid, type GridPaginationModel} from '@mui/x-data-grid';

import { columns } from './data/gridData';
import {useEffect, useState} from "react";
import {type AniHistoryInfo, api} from "@/utils/api.ts";


export default function CustomizedDataGrid() {


    const [rows, setRows] = useState<AniHistoryInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [rowCount, setRowCount] = useState(0);

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 20,
        page: 0,
    });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // 调用你封装的服务端分页 API
                const res = await api.queryAniHistoryList({
                        page : paginationModel.page + 1,
                        pageSize : paginationModel.pageSize
                    });
                // res.items 是当前页数据，res.total 是总条数
                setRows(res.items);
                setRowCount(res.total);
            } catch (err) {
                console.error(err);
                setRows([]);
                setRowCount(0);
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, [paginationModel]);

    return (
        <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            disableColumnResize
            density="compact"
        />
    );
}