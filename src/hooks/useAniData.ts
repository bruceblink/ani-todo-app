import { useState, useEffect, useCallback } from 'react';
import type { Ani } from '../components/AniItem.tsx';
import {
    fetchAniData, invokeCommand,
} from '../utils/utils.ts';

// 单个请求可能的结果
type RequestResult =
    | { name: string; data: Record<string, Ani[]> }
    | { name: string; error: Error };

// Hook 对外暴露的状态
export type UseAniData = {
    data: Record<string, Ani[]>;
    loading: boolean;
    error: string | null;
    errors: Record<string, string>;
    /** 刷新网络并重新加载，返回一个 Promise */
    refresh: () => Promise<void>;
};

// 数据源描述
type DataSource = {
    name: string;
    url?: string;
    cmd: string;
};

export function useAniData(): UseAniData {
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

    // 从网络拉取并写库
    const fetchData = useCallback(async () => {
        resetState();
        try {
            const sources: DataSource[] = [
                {
                    name: '哔哩哔哩国创',
                    url: 'https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6',
                    cmd: 'fetch_bilibili_ani_data',
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
/*                {
                    name: '蜜柑计划',
                    url: 'https://mikanani.me',
                    cmd: 'fetch_mikanani_ani_data',
                },*/
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
                {
                    name: 'AGE动漫',
                    url: 'https://www.agedm.vip/update',
                    cmd: 'fetch_agedm_ani_data'
                },
                // ...其他接口
            ];

            const settled = await Promise.allSettled(
                sources.map(({ url, cmd, name }) =>
                    fetchAniData(url!, cmd)
                        .then((d) => ({ name, data: d }))
                        .catch((err) => ({ name, error: err }))
                )
            );

            const resultErrors: Record<string, string> = {};
            const successList: Record<string, Ani[]>[] = [];

            settled.forEach((r, idx) => {
                if (r.status === 'fulfilled') {
                    const v = r.value as RequestResult;
                    if ('error' in v) {
                        resultErrors[v.name] = v.error.message || '未知错误';
                    } else {
                        successList.push(v.data);
                    }
                } else {
                    const src = sources[idx];
                    resultErrors[src.name] = (r.reason as Error).message || '未知错误';
                }
            });

            if (successList.length === 0) {
                // 全部网络请求都失败，直接设置错误状态并返回
                setErrors(resultErrors);
                const first = Object.keys(resultErrors)[0] || '所有源';
                setError(`${first} 请求失败`);
                return;
            }

            // 合并成功的数据
            const merged = successList.reduce<Record<string, Ani[]>>((acc, cur) => {
                Object.entries(cur).forEach(([week, list]) => {
                    acc[week] = (acc[week] || []).concat(list);
                });
                return acc;
            }, {});

            // 保存到数据库
            await invokeCommand("save_ani_item_data", {aniData: merged});

            // 如果有部分失败，保留 errors 和摘要
            if (Object.keys(resultErrors).length > 0) {
                setErrors(resultErrors);
                const first = Object.keys(resultErrors)[0];
                setError(`部分请求失败（${first} 等）`);
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error('未知错误');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [resetState]);

    // 只从本地数据库加载
    const loadData = useCallback(async () => {
        resetState();
        try {
            const sources: DataSource[] = [{ name: '本地读取', cmd: 'query_ani_item_data_list' }];

            const settled = await Promise.allSettled(
                sources.map(({ cmd, name }) =>
                    invokeCommand(cmd)
                        .then((d) => ({ name, data: d }))
                        .catch((err) => ({ name, error: err }))
                )
            );

            const resultErrors: Record<string, string> = {};
            const successList: Record<string, Ani[]>[] = [];

            settled.forEach((r, idx) => {
                if (r.status === 'fulfilled') {
                    const v = r.value as { name: string; data?: Record<string, Ani[]>; error?: Error };
                    if (v.error) {
                        resultErrors[v.name] = v.error.message || '未知错误';
                    } else if (v.data) {
                        successList.push(v.data);
                    }
                } else {
                    const name = sources[idx].name;
                    resultErrors[name] = (r.reason as Error).message || '未知错误';
                }
            });

            if (successList.length > 0) {
                const merged = successList.reduce<Record<string, Ani[]>>((acc, cur) => {
                    Object.entries(cur).forEach(([week, list]) => {
                        acc[week] = (acc[week] || []).concat(list);
                    });
                    return acc;
                }, {});
                setData(merged);
            }

            if (Object.keys(resultErrors).length > 0) {
                setErrors(resultErrors);
                const first = Object.keys(resultErrors)[0];
                setError(`部分加载失败（${first}）`);
            }
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
        await fetchData();
        await loadData();
    }, [fetchData, loadData]);

    return { data, loading, error, errors, refresh };
}