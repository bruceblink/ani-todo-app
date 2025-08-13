import Chip from '@mui/material/Chip';
import type {GridColDef} from '@mui/x-data-grid';
import {formatUnixTimestampMs} from "@/utils/utils.ts";

function renderStatus(isWatcher: boolean) {

  return isWatcher ? <Chip label="已观看" color="success" size="small" />:
      <Chip label="未观看" color="default" size="small" />;
}
export const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: '动漫标题',
    flex: 1.5,
    minWidth: 200
  },
  {
    field: 'updateCount',
    headerName: '集数',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'isWatched',
    headerName: '观看状态',
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value),
  },
  {
    field: 'userId',
    headerName: '用户',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'updateTime',
    headerName: '更新时间',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
    renderCell: (params) => formatUnixTimestampMs(params.value),
  },
  {
    field: 'watchedTime',
    headerName: '观看时间',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
    renderCell: (params) => formatUnixTimestampMs(params.value),
  },
  {
    field: 'platform',
    headerName: '播出平台',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
];
