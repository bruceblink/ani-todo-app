import {useCallback, useEffect, useState} from 'react';
import {type Ani, api} from "@/utils/api";

// Hook 对外暴露的状态
export type AniData = {
    data: Record<string, Ani[]>;
    loading: boolean;
    error: string | null;
    errors: Record<string, string>;
    /** 刷新网络并重新加载，返回一个 Promise */
    refresh: () => Promise<void>;
};


export function useAniData(): AniData {
    const [data, setData] = useState<Record<string, Ani[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 重置 loading 和 error 状态
    const resetState = useCallback(() => {
        setLoading(true);
        setError(null);
        setErrors({});
    }, []);
    // 只从本地数据库加载
    const loadData = useCallback(async () => {
        resetState();
        try {
            const res = await api.queryTodayUpdateAniList()
            setData(res);
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error('未知错误');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [resetState]);

    // 初次挂载只读取本地
    useEffect(() => {
        void loadData();
    }, [loadData]);

    // 刷新时：先网络拉取再本地加载
    const refresh = useCallback(async () => {
        //await fetchData();
        await loadData();
    }, [loadData]);

    return { data, loading, error, errors, refresh };
}