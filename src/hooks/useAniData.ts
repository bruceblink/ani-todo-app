import { useState, useEffect, useCallback } from 'react';
import type {Ani} from "../components/AniItem.tsx";
import {loadAniData} from "../utils/utils.ts";

type UseAniData = {
    data: Record<string, Ani[]>;
    loading: boolean;
    error: string | null;
    refresh: () => void;
};

export function useAniData(): UseAniData {
    const [data, setData] = useState<Record<string, Ani[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const sources = [
                {
                    url: 'https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6',  //哔哩哔哩国创
                    cmd: 'fetch_bilibili_ani_data'
                },
                {
                    url: 'https://api.bilibili.com/pgc/web/timeline?types=1&before=6&after=6',  //哔哩哔哩番剧
                    cmd: 'fetch_bilibili_ani_data',
                },
                {
                    url: 'https://mesh.if.iqiyi.com/portal/lw/v7/channel/cartoon',  //爱奇艺动漫
                    cmd: 'fetch_iqiyi_ani_data',
                },
                {
                    url: 'https://mikanani.me',  //蜜柑计划
                    cmd: 'fetch_mikanani_ani_data',
                },
                // ...如果有更多接口
            ] as const;

            const results = await Promise.all(
                sources.map(({ url, cmd }) => loadAniData(url, cmd) as Promise<Record<string, Ani[]>>)
            );

            const merged = results.reduce<Record<string, Ani[]>>((acc, cur) => {
                (Object.entries(cur) as [string, Ani[]][]).forEach(([wk, list]) => {
                    acc[wk] = (acc[wk] || []).concat(list);
                });
                return acc;
            }, {});

            setData(merged);
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error('未知错误');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();  //使用void是告诉 ESLint “我知道这是个 Promise，我不需要在这里再 .then/.catch”
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData };
}
