import React from "react";
import {
    TableHead,
    TableRow,
    TableCell,
    Stack,
    IconButton,
    Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { flexRender, type Table, type SortingState } from "@tanstack/react-table";
import FilterMenu from "./FilterMenu";

interface TableHeaderCellProps<T extends Record<string, unknown>> {
    table: Table<T>;
    sorting: SortingState;
    setSorting: (s: SortingState) => void;
    filters: Record<string, Set<string>>;
    setFilters: React.Dispatch<React.SetStateAction<Record<string, Set<string>>>>;
    filterSearch: Record<string, string>;
    setFilterSearch: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    anchorEls: Record<string, HTMLElement | null>;
    setAnchorEls: React.Dispatch<
        React.SetStateAction<Record<string, HTMLElement | null>>
    >;
    rows: T[];
}

export default function TableHeaderCell<T extends Record<string, unknown>>({
                                                                               table,
                                                                               sorting,
                                                                               setSorting,
                                                                               filters,
                                                                               setFilters,
                                                                               filterSearch,
                                                                               setFilterSearch,
                                                                               anchorEls,
                                                                               setAnchorEls,
                                                                               rows,
                                                                           }: TableHeaderCellProps<T>) {
    const uniqueValues = (key: keyof T) =>
        Array.from(new Set(rows.map((r) => String(r[key]))));

    const handleToggleFilter = (columnId: string, value: string) => {
        setFilters((prev) => {
            const newSet = new Set(prev[columnId] ?? []);
            if (newSet.has(value)) newSet.delete(value);
            else newSet.add(value);
            return { ...prev, [columnId]: newSet };
        });
    };

    const handleToggleAll = (columnId: string) => {
        const allVals = uniqueValues(columnId as keyof T);
        const current = filters[columnId] ?? new Set<string>();
        if (current.size === allVals.length) {
            setFilters((prev) => ({ ...prev, [columnId]: new Set() }));
        } else {
            setFilters((prev) => ({ ...prev, [columnId]: new Set(allVals) }));
        }
    };

    const handleOpenMenu = (columnId: string, el: HTMLElement) => {
        setAnchorEls((prev) => ({ ...prev, [columnId]: el }));
    };

    const handleCloseMenu = (columnId: string) => {
        setAnchorEls((prev) => ({ ...prev, [columnId]: null }));
    };

    return (
        <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <TableCell
                            key={header.id}
                            sx={{ fontWeight: "bold", position: "relative" }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {flexRender(header.column.columnDef.header, header.getContext())}

                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    {/* 排序按钮 */}
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            const s = sorting.find((s) => s.id === header.column.id);
                                            if (!s) setSorting([{ id: header.column.id, desc: false }]);
                                            else if (!s.desc)
                                                setSorting([{ id: header.column.id, desc: true }]);
                                            else setSorting([]);
                                        }}
                                    >
                                        {sorting.find((s) => s.id === header.column.id)?.desc ? (
                                            <ArrowDownwardIcon fontSize="small" />
                                        ) : sorting.find((s) => s.id === header.column.id) ? (
                                            <ArrowUpwardIcon fontSize="small" />
                                        ) : (
                                            <ArrowUpwardIcon fontSize="small" sx={{ opacity: 0.3 }} />
                                        )}
                                    </IconButton>

                                    {/* 筛选按钮 */}
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleOpenMenu(header.column.id, e.currentTarget)}
                                    >
                                        <FilterListIcon fontSize="small" />
                                        {filters[header.column.id]?.size ? (
                                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                {filters[header.column.id].size}
                                            </Typography>
                                        ) : null}
                                    </IconButton>

                                    <FilterMenu
                                        anchorEl={anchorEls[header.column.id] ?? null}
                                        open={Boolean(anchorEls[header.column.id])}
                                        onClose={() => handleCloseMenu(header.column.id)}
                                        values={uniqueValues(header.column.id as keyof T)}
                                        selectedValues={filters[header.column.id] ?? new Set()}
                                        onToggleValue={(v) => handleToggleFilter(header.column.id, v)}
                                        onToggleAll={() => handleToggleAll(header.column.id)}
                                        searchValue={filterSearch[header.column.id] ?? ""}
                                        onSearchChange={(v) =>
                                            setFilterSearch((prev) => ({ ...prev, [header.column.id]: v }))
                                        }
                                    />
                                </Stack>
                            </Stack>
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableHead>
    );
}