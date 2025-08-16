import { TableRow, TableCell } from "@mui/material";
import { flexRender, type Row } from "@tanstack/react-table";

interface TableRowItemProps<T> {
    row: Row<T>;
    onClick: () => void;
}

export default function TableRowItem<T>({
                                            row,
                                            onClick,
                                        }: TableRowItemProps<T>) {
    return (
        <TableRow hover onClick={onClick}>
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    );
}
