import { useState, useEffect, useCallback } from 'react';
import { type AniHistoryInfo, api } from "@/utils/api";

export type UseAniHistoryData = {
    data: {
        total: number;
        items: AniHistoryInfo[];
    } | null;
    loading: boolean;
    error: string | null;
    /** 刷新网络并重新加载，返回一个 Promise */
    refresh: () => Promise<void>;
};

export function useAniHistoryData(
    page: number,
    pageSize: number
): UseAniHistoryData {
    const [data, setData] = useState<{ total: number; items: AniHistoryInfo[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.queryAniHistoryList({ page, pageSize });
            setData(res);
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error('未知错误');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const refresh = useCallback(async () => {
        await loadData();
    }, [loadData]);

    return { data, loading, error, refresh };
}
