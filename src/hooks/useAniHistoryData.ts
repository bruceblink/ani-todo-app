import { useState, useEffect, useCallback } from 'react';
import { type AniHistoryInfo, api } from "@/utils/api";

export type UseAniHistoryData = {
    data: {
        total: number;
        items: AniHistoryInfo[];
    } | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

export function useAniHistoryData(
    page: number,
    pageSize: number,
    isServer: boolean = true // 新增参数，默认服务端模式
): UseAniHistoryData {
    const [data, setData] = useState<{ total: number; items: AniHistoryInfo[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.queryAniHistoryList({
                page: isServer ? page : 1,
                pageSize: isServer ? pageSize : Number.MAX_SAFE_INTEGER, // 本地模式一次性拉全量
            });
            setData(res);
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error('未知错误');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, isServer]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const refresh = useCallback(async () => {
        await loadData();
    }, [loadData]);

    return { data, loading, error, refresh };
}