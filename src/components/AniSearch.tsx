import React, { useState, useRef, useEffect } from 'react';

interface SearchProps {
    onSearch: (value: string) => void;
}

export default function AniSearch({ onSearch }: SearchProps) {
    const [expanded, setExpanded] = useState(false);
    const [value, setValue] = useState("");
    const [isComposing, setIsComposing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // 展开时自动聚焦输入框
    useEffect(() => {
        if (expanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [expanded]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        if (!isComposing) {
            onSearch(e.target.value);
        }
    };

    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        setIsComposing(false);
        onSearch(e.currentTarget.value); // 中文确认后再触发一次
    };

    return (
        <div className="search-wrap">
            {expanded ? (
                <input
                    className="search-input expanded"
                    type="text"
                    placeholder="输入动漫标题搜索..."
                    ref={inputRef}
                    value={value}
                    onChange={handleChange}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    onBlur={() => setExpanded(false)}
                />
            ) : (
                <button
                    className="search-btn"
                    type="button"
                    aria-label="Open search"
                    onClick={() => setExpanded(true)}
                >
                    {/* 用 SVG 画放大镜 */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="6" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </button>
            )}
        </div>
    );
}
