import {useCallback, useEffect, useRef} from "react";

/**
 * 类型安全的防抖 Hook
 * T 是回调函数类型，例如 (v: string) => void
 * 返回值会正确推断为 (...args: Parameters<T>) => void
 */
export function useDebouncedCallback<Args extends unknown[]>(
    cb: (...args: Args) => void,
    delay: number
) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const savedCb = useRef(cb);

    // 保证 cb 最新
    useEffect(() => {
        savedCb.current = cb;
    }, [cb]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return useCallback((...args: Args) => {
        if (delay <= 0) {
            savedCb.current(...args);
            return;
        }

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            savedCb.current(...args);
            timerRef.current = null;
        }, delay);
    }, [delay]);
}