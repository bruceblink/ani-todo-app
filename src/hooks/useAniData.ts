import { useCallback, useEffect, useState } from 'react';
import { type Ani, api } from "@/utils/api";

// Hook 对外暴露的状态
export type AniData = {
    data: Record<string, Ani[]>;
    loading: boolean;
    error: string | null;
    errors: Record<string, string>;
    /** 刷新并重新加载，返回一个 Promise */
    refresh: () => Promise<void>;
};

interface UseAniDataOptions {
    /** 如果提供，则查询该日期（格式：YYYY/MM/DD + 星期X），否则查询今日 */
    dateStr?: string;
    weekdayLabel?: string;
}

export function useAniData(options?: UseAniDataOptions): AniData {
    const [data, setData] = useState<Record<string, Ani[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors] = useState<Record<string, string>>({});

    const { dateStr, weekdayLabel } = options ?? {};

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res: Record<string, Ani[]>;
            if (dateStr && weekdayLabel) {
                res = await api.queryDateUpdateAniList(dateStr, weekdayLabel);
            } else {
                res = await api.queryTodayUpdateAniList();
            }
            setData(res);
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error('未知错误');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [dateStr, weekdayLabel]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const refresh = useCallback(async () => {
        await loadData();
    }, [loadData]);

    return { data, loading, error, errors, refresh };
}
