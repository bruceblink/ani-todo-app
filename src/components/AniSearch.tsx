import React, { useState, useRef, useEffect } from "react";
import { IconButton, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchProps {
    onSearch: (value: string) => void;
}

export default function AniSearch({ onSearch }: SearchProps) {
    const [expanded, setExpanded] = useState(false);
    const [value, setValue] = useState("");
    const [isComposing, setIsComposing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // 展开时自动聚焦输入框并把光标移到末尾
    useEffect(() => {
        if (expanded && inputRef.current) {
            inputRef.current.focus();
            const len = inputRef.current.value.length;
            inputRef.current.setSelectionRange(len, len);
        }
    }, [expanded]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        if (!isComposing) {
            onSearch(v);
        }
    };

    const handleCompositionStart = () => setIsComposing(true);

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        setIsComposing(false);
        const v = (e.target as HTMLInputElement).value ?? "";
        setValue(v);
        onSearch(v);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !isComposing) {
            e.preventDefault();
            onSearch(value);
        }
    };

    // 重点：失去焦点时清空输入并清除搜索条件
    const handleBlur = () => {
        // 清空外部搜索条件（给外层回调空字符串）
        onSearch("");
        // 清空内部显示值
        setValue("");
        // 收起输入框
        setExpanded(false);
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {expanded ? (
                <Paper
                    component="form"
                    sx={{
                        p: "2px 4px",
                        display: "flex",
                        alignItems: "center",
                        width: 260,
                        transition: "all 0.3s ease",
                        borderRadius: "24px",
                        boxShadow: 3,
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isComposing) onSearch(value);
                    }}
                >
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="输入动漫标题或播放平台搜索..."
                        inputRef={inputRef}
                        value={value}
                        onChange={handleChange}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                    />
                </Paper>
            ) : (
                <IconButton
                    color="primary"
                    aria-label="search"
                    onClick={() => setExpanded(true)}
                    sx={{ borderRadius: "50%", boxShadow: 2 }}
                >
                    <SearchIcon />
                </IconButton>
            )}
        </div>
    );
}
