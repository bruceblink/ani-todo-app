import React, { useState, useRef, useEffect, useCallback } from "react";
import { IconButton, InputBase, Paper, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useDebouncedCallback} from "@/hooks/useDebounced.ts";

/**
 * AniSearch props
 * - debounceMs: 防抖延迟（ms），0 表示不防抖。默认 300。
 * - persistKey: 如果提供，会把最后一次搜索存到 localStorage[persistKey]，并作为折叠状态下的 Chip / 展开时的 placeholder。
 * - clearOnBlur: 失去焦点时是否清空搜索并调用 onSearch('')（默认 false -> 保留搜索）
 */
interface SearchProps {
    onSearch: (value: string) => void;
    debounceMs?: number;
    persistKey?: string; // e.g. 'aniSearch.last'
    clearOnBlur?: boolean;
}



export default function AniSearch({
                                      onSearch,
                                      debounceMs = 300,
                                      persistKey,
                                      clearOnBlur = false,
                                  }: SearchProps) {
    const [expanded, setExpanded] = useState(false);
    const [value, setValue] = useState("");
    const [isComposing, setIsComposing] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // 读取 persisted last search（如果有）
    const [last, setLast] = useState<string>(() => {
        try {
            if (!persistKey) return "";
            const v = localStorage.getItem(persistKey);
            return v ?? "";
        } catch {
            return "";
        }
    });

    // 保存 last 到 localStorage（封装成 useCallback 以便稳定引用）
    const persistLast = useCallback(
        (v: string) => {
            try {
                if (!persistKey) return;
                if (v) localStorage.setItem(persistKey, v);
                else localStorage.removeItem(persistKey);
                setLast(v);
            } catch {
                // ignore
            }
        },
        [persistKey]
    );

    // 把外部 onSearch 包成防抖回调（注意：composition 期间不触发）
    const debouncedOnSearch = useDebouncedCallback(
        (v: string) => {
            onSearch(v);
            persistLast(v);
        },
        debounceMs
    );

    useEffect(() => {
        if (expanded && inputRef.current) {
            inputRef.current.focus();
            const len = inputRef.current.value.length;
            try {
                inputRef.current.setSelectionRange(len, len);
            } catch {
                // 某些环境可能不支持 setSelectionRange，忽略
            }
        }
    }, [expanded]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        if (!isComposing) {
            // 如果设置了防抖，调用防抖版本；否则直接触发
            if (debounceMs > 0) debouncedOnSearch(v);
            else {
                onSearch(v);
                persistLast(v);
            }
        }
    };

    const handleCompositionStart = () => setIsComposing(true);

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        setIsComposing(false);
        const v = (e.target as HTMLInputElement).value ?? "";
        setValue(v);
        // compositionend 时直接触发（不走防抖），以保证中文立即生效
        onSearch(v);
        persistLast(v);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !isComposing) {
            e.preventDefault();
            // 按 Enter 时立即触发（不走防抖）
            onSearch(value);
            persistLast(value);
        }
    };

    const handleBlur = () => {
        if (clearOnBlur) {
            // 如果需要失去焦点清除（可选），则清空并通知外部
            setValue("");
            onSearch("");
            persistLast("");
        }
        // 收起输入框（如果你想保留展开可以去掉下一行）
        setExpanded(false);
    };

    const handleClear = () => {
        setValue("");
        onSearch("");
        persistLast("");
        // 如果处于折叠状态并且没有展开，就把 last 也清掉（Chip 会消失）
        if (!expanded) setLast("");
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* 折叠状态下：显示搜索按钮 + 如果有历史则显示 Chip */}
            {!expanded && (
                <>
                    <IconButton
                        color="primary"
                        aria-label="search"
                        onClick={() => {
                            setExpanded(true);
                            // 展开时把内部 value 设置为 last（如果当前无 value 且有 last）
                            if (!value && last) setValue(last);
                        }}
                        sx={{ borderRadius: "50%", boxShadow: 2 }}
                    >
                        <SearchIcon />
                    </IconButton>

                    {last ? (
                        <Chip
                            label={`筛选: "${last}"`}
                            onDelete={handleClear}
                            size="small"
                        />
                    ) : null}
                </>
            )}

            {/* 展开状态下：显示输入框 */}
            {expanded && (
                <Paper
                    component="form"
                    sx={{
                        p: "2px 4px",
                        display: "flex",
                        alignItems: "center",
                        width: 300,
                        transition: "all 0.18s ease",
                        borderRadius: "24px",
                        boxShadow: 3,
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isComposing) {
                            onSearch(value);
                            persistLast(value);
                        }
                    }}
                >
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder={last ? `上次搜索: ${last}` : "输入动漫标题或播出平台搜索..."}
                        inputRef={inputRef}
                        value={value}
                        onChange={handleChange}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                    />

                    {/* 展开时也给个清除按钮（方便用户手动清除，不用失去焦点） */}
                    <IconButton
                        aria-label="clear"
                        onClick={() => {
                            setValue("");
                            onSearch("");
                            persistLast("");
                            // 保持展开状态以便继续输入
                            if (inputRef.current) inputRef.current.focus();
                        }}
                        size="small"
                    >
                        ×
                    </IconButton>
                </Paper>
            )}
        </div>
    );
}
