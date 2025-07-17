import { useState, useEffect, useCallback } from 'react';
import type {Ani} from "../components/AniItem.tsx";
import {loadAniData, saveLoadedAniData2Database} from "../utils/utils.ts";

// 定义请求结果类型 - 使用联合类型确保类型安全
type RequestResult =
    | { name: string; data: Record<string, Ani[]> }
    | { name: string; error: Error };

type UseAniData = {
    data: Record<string, Ani[]>;
    loading: boolean;
    error: string | null;
    errors: Record<string, string>;
    refresh: () => void;
};

// 定义请求源类型
type DataSource = {
    url: string;
    cmd: string;
    name: string;
};

export function useAniData(): UseAniData {
    const [data, setData] = useState<Record<string, Ani[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setErrors({});

        try {
            const sources: DataSource[] = [
                {
                    name: '哔哩哔哩国创',
                    url: 'https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6',
                    cmd: 'fetch_bilibili_ani_data'
                },
                {
                    name: '哔哩哔哩番剧',
                    url: 'https://api.bilibili.com/pgc/web/timeline?types=1&before=6&after=6',
                    cmd: 'fetch_bilibili_ani_data',
                },
                {
                    name: '爱奇艺动漫',
                    url: 'https://mesh.if.iqiyi.com/portal/lw/v7/channel/cartoon',
                    cmd: 'fetch_iqiyi_ani_data',
                },
                {
                    name: '蜜柑计划',
                    url: 'https://mikanani.me',
                    cmd: 'fetch_mikanani_ani_data',
                },
                {
                    name: '腾讯视频',
                    url: 'https://v.qq.com/channel/cartoon',
                    cmd: 'fetch_qq_ani_data',
                },
                {
                    name: '优酷视频',
                    url: 'https://www.youku.com/ku/webcomic',
                    cmd: 'fetch_youku_ani_data',
                },
                // ...其他接口
            ];

            // 使用 Promise.allSettled 确保单个请求失败不影响其他结果
            const results = await Promise.allSettled(
                sources.map(({ url, cmd, name }) =>
                    loadAniData(url, cmd)
                        .then(data => ({ name, data }))
                        .catch(error => ({ name, error }))
                )
            );

            // 处理结果并记录错误
            const newErrors: Record<string, string> = {};
            const successfulResults: Record<string, Ani[]>[] = [];

            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    const value = result.value as RequestResult;

                    if ('error' in value) {
                        // 请求失败但被捕获的情况
                        newErrors[value.name] = value.error.message || '请求失败';
                    } else if ('data' in value) {
                        // 请求成功 - 确保 data 存在且有效
                        successfulResults.push(value.data);
                    }
                } else {
                    // Promise 被拒绝的情况
                    const reason = result.reason;
                    const source = sources[results.indexOf(result)];
                    newErrors[source.name] = reason.message || '请求失败';
                }
            });

            // 设置错误状态
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);

                // 如果有多个错误，只显示第一个错误摘要
                const firstErrorKey = Object.keys(newErrors)[0];
                setError(`部分请求失败（${firstErrorKey}等）`);
            }

            // 合并成功的数据
            if (successfulResults.length > 0) {
                const merged = successfulResults.reduce<Record<string, Ani[]>>((acc, cur) => {
                    (Object.entries(cur) as [string, Ani[]][]).forEach(([wk, list]) => {
                        acc[wk] = (acc[wk] || []).concat(list);
                    });
                    return acc;
                }, {});
                await saveLoadedAniData2Database(merged);
                setData(merged);
            } else if (Object.keys(newErrors).length > 0) {
                // 所有请求都失败的情况
                setError('所有请求均失败，请检查网络或稍后重试');
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error('未知错误');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh: fetchData, errors };
}