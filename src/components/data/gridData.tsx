import Chip from '@mui/material/Chip';
import type {GridColDef} from '@mui/x-data-grid';
import {formatUnixMs2Date, formatUnixMs2Timestamp} from "@/utils/utils.ts";

function renderStatus(isWatcher: boolean) {

  return isWatcher ? <Chip label="已观看" color="success" size="small" />:
      <Chip label="未观看" color="default" size="small" />;
}
export const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: '动漫标题',
    flex: 2,
    minWidth: 250
  },
  {
    field: 'updateCount',
    headerName: '集数',
    headerAlign: 'center',
    align: 'center',
    flex: 0.5,
    minWidth: 50,
  },
  {
    field: 'updateTime',
    headerName: '更新日期',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 80,
    renderCell: (params) => formatUnixMs2Date(params.value),
  },
  {
    field: 'isWatched',
    headerName: '观看状态',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value),
  },
/*  {
    field: 'userId',
    headerName: '用户',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 80,
  },*/
  {
    field: 'watchedTime',
    headerName: '观看时间',
    headerAlign: 'right',
    align: 'right',
    flex: 1.5,
    minWidth: 120,
    renderCell: (params) => formatUnixMs2Timestamp(params.value),
  },
  {
    field: 'platform',
    headerName: '播出平台',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 80,
  },
];
