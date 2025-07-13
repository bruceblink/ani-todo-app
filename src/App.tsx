import './App.css';
import AniItem, { type Ani } from './components/AniItem';
import { useState, useEffect, useCallback } from 'react';
import { getAniId, loadAniData } from './utils/utils';

export default function App() {
    // 1. 全部数据
    const [data, setData] = useState<Record<string, Ani[]>>({});
    // 2. 错误 & 加载状态
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // 3. 已清除集合
    const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('clearedAni');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // fetchData：负责调用后端命令，获取并合并多源数据
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 你可以在此添加多个 URL/命令对
            const sources = [
                {
                    url: 'https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6',
                    cmd: 'fetch_bilibili_ani_data',
                },
                {
                    url: 'https://api.bilibili.com/pgc/web/timeline?types=1&before=6&after=6',  //哔哩哔哩番剧
                    cmd: 'fetch_bilibili_ani_data',
                },
                // 继续添加更多 { url, cmd } 对
            ] as const;

            // 并行请求
            const results = await Promise.all(
                sources.map(({ url, cmd }) =>
                    loadAniData(url, cmd) as Promise<Record<string, Ani[]>>
                )
            );

            // 合并所有接口返回的数据
            const merged = results.reduce<Record<string, Ani[]>>((acc, cur) => {
                (Object.entries(cur) as [string, Ani[]][]).forEach(
                    ([weekday, list]) => {
                        if (!acc[weekday]) {
                            acc[weekday] = [];
                        }
                        acc[weekday] = acc[weekday]!.concat(list);
                    }
                );
                return acc;
            }, {});

            setData(merged);
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error('未知错误');
            console.error('loadAniData failed', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // 首次挂载自动拉取
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // “清除”按钮逻辑
    const handleClear = (id: string) => {
        setClearedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            localStorage.setItem('clearedAni', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    // 渲染部分
    if (loading) {
        return (
            <div className="App">
                <button onClick={fetchData} disabled>
                    刷新中…
                </button>
                <div>加载中…</div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="App">
                <button onClick={fetchData}>重试</button>
                <div>出错了：{error}</div>
            </div>
        );
    }

    const weekdays = Object.keys(data);
    if (weekdays.length === 0) {
        return (
            <div className="App">
                <button onClick={fetchData}>刷新</button>
                <div>无数据</div>
            </div>
        );
    }

    // 取第一个 key 作为今天
    const today = weekdays[0];
    const aniList = data[today] || [];
    // 过滤已清除的
    const filtered = aniList.filter((ani) => !clearedIds.has(getAniId(ani)));

    return (
        <div className="App">
            <div className="header">
                <h1>
                    {today} 更新番剧 共 {aniList.length} 部
                </h1>
                <button onClick={fetchData} disabled={loading}>
                    {loading ? '刷新中…' : '刷新'}
                </button>
            </div>
            <div className="ani-list">
                {filtered.map((ani) => (
                    <AniItem key={getAniId(ani)} ani={ani} onClear={handleClear} />
                ))}
            </div>
        </div>
    );
}
