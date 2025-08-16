import { useMemo, useState, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,

} from "@tanstack/react-table";
import {
    Box,
    Table,
    TableBody,
    TableContainer,
    Paper,
} from "@mui/material";

import TableHeaderCell from "./TableHeaderCell";
import TableRowItem from "./TableRowItem";
import Pagination from "./Pagination";
import DetailDialog from "./DetailDialog";

export interface CustomDataGridProps<T extends Record<string, unknown>> {
    rows: T[];
    columns: ColumnDef<T>[];
    pageSizeOptions?: number[];
    initialPageSize?: number;
    onRowClick?: (row: T) => void;
}

export default function CustomDataGrid<T extends Record<string, unknown>>({
                                                                              rows,
                                                                              columns,
                                                                              pageSizeOptions = [5, 10, 20, 50],
                                                                              initialPageSize = 10,
                                                                              onRowClick,
                                                                          }: CustomDataGridProps<T>) {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [filters, setFilters] = useState<Record<string, Set<string>>>({});
    const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
    const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});
    const [selectedRow, setSelectedRow] = useState<T | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // 过滤后的数据
    const filteredData = useMemo(() => {
        return rows.filter((row) =>
            Object.entries(filters).every(([key, valSet]) => {
                if (!valSet || valSet.size === 0) return true;
                return valSet.has(String(row[key as keyof T]));
            })
        );
    }, [rows, filters]);

    // 筛选或 pageSize 改变时，重置页码
    useEffect(() => setPageIndex(0), [filters, pageSize]);

    // react-table
    const table = useReactTable({
        data: filteredData,
        columns,
        state: { pagination: { pageIndex, pageSize }, sorting },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
    });

    const totalPages = Math.max(
        1,
        Math.ceil(table.getRowModel().rows.length / pageSize)
    );

    return (
        <Box p={2}>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                    {/* 表头 */}
                    <TableHeaderCell
                        table={table}
                        sorting={sorting}
                        setSorting={setSorting}
                        filters={filters}
                        setFilters={setFilters}
                        filterSearch={filterSearch}
                        setFilterSearch={setFilterSearch}
                        anchorEls={anchorEls}
                        setAnchorEls={setAnchorEls}
                        rows={rows}
                    />

                    {/* 表体 */}
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRowItem
                                key={row.id}
                                row={row}
                                onClick={() => {
                                    setSelectedRow(row.original);
                                    setDialogOpen(true);
                                    onRowClick?.(row.original);
                                }}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 分页 */}
            <Pagination
                pageIndex={pageIndex}
                totalPages={totalPages}
                totalCount={table.getRowModel().rows.length}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                setPageIndex={setPageIndex}
                setPageSize={setPageSize}
            />

            {/* 行详情 */}
            <DetailDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                rowData={selectedRow}
            />
        </Box>
    );
}
