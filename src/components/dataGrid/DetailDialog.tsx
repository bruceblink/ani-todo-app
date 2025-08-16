import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface DetailDialogProps<T extends { title?: string }> {
    open: boolean;
    onClose: () => void;
    rowData: T | null;
}

export default function DetailDialog<T extends { title?: string }>({
                                                                       open,
                                                                       onClose,
                                                                       rowData,
                                                                   }: DetailDialogProps<T>) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {rowData?.title ?? "详情"}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: "absolute", right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <pre>{JSON.stringify(rowData, null, 2)}</pre>
            </DialogContent>
        </Dialog>
    );
}
