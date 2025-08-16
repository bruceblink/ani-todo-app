import React from "react";
import {
    Menu,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Divider,
    Typography,
    Box,
    TextField,
} from "@mui/material";

interface FilterMenuProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    values: string[];
    selectedValues: Set<string>;
    onToggleValue: (value: string) => void;
    onToggleAll: () => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
}

const FilterMenu = React.memo(function FilterMenu({
                                                      anchorEl,
                                                      open,
                                                      onClose,
                                                      values,
                                                      selectedValues,
                                                      onToggleValue,
                                                      onToggleAll,
                                                      searchValue,
                                                      onSearchChange,
                                                  }: FilterMenuProps) {
    const allSelected = selectedValues.size === values.length && values.length > 0;
    const indeterminate = selectedValues.size > 0 && selectedValues.size < values.length;

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            slotProps={{ paper: { sx: { width: 220, p: 1 } } }}
        >
            <TextField
                size="small"
                placeholder="搜索..."
                fullWidth
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ mb: 1 }}
            />

            <FormControlLabel
                label="全选"
                control={<Checkbox checked={allSelected} indeterminate={indeterminate} onChange={onToggleAll} />}
                sx={{ width: "100%", m: 0 }}
            />

            <Divider sx={{ my: 1 }} />

            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                {values
                    .filter((v) => v.includes(searchValue))
                    .map((v) => (
                        <MenuItem key={v} disableGutters>
                            <FormControlLabel
                                control={<Checkbox checked={selectedValues.has(v)} onChange={() => onToggleValue(v)} />}
                                label={v}
                                sx={{ width: "100%", m: 0 }}
                            />
                        </MenuItem>
                    ))}
            </Box>

            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ px: 1 }}>
                已选 {selectedValues.size} 项
            </Typography>
        </Menu>
    );
});

export default FilterMenu;
