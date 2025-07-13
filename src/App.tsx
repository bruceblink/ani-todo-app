// src/App.tsx
import './App.css';
import AniItem, { type Ani } from './components/AniItem';
import { useState, useEffect } from 'react';
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

    // 3. 首次渲染时拉取数据
    useEffect(() => {
        (async () => {
            try {
                const urls = [
                    'https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6',
                    'https://api.bilibili.com/pgc/web/timeline?types=1&before=6&after=6',
                ];

                // 显式声明 Promise 类型，告诉 TS 返回 Record<string, Ani[]>
                const promises: Promise<Record<string, Ani[]>>[] = urls.map((url) =>
                    loadAniData(url, 'fetch_bilibili_ani_data') as Promise<Record<string, Ani[]>>
                );

                const results = await Promise.all(promises);

                const merged = results.reduce<Record<string, Ani[]>>((acc, cur) => {
                    // cur 已知是 Record<string, Ani[]>
                    (Object.entries(cur) as [string, Ani[]][]).forEach(([weekday, list]) => {
                        if (!acc[weekday]) {
                            acc[weekday] = [];
                        }
                        // list 现在被 TS 识别为 Ani[]，可以安全 concat
                        acc[weekday] = acc[weekday]!.concat(list);
                    });
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
        })();
    }, []);

    // 清除单个番剧
    const handleClear = (id: string) => {
        setClearedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            localStorage.setItem('clearedAni', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    // 渲染逻辑
    if (loading) {
        return <div className="App">加载中…</div>;
    }
    if (error) {
        return <div className="App">出错了：{error}</div>;
    }
    // 如果没有任何数据
    const weekdays = Object.keys(data);
    if (weekdays.length === 0) {
        return <div className="App">无数据</div>;
    }

    // 取第一个 key 作为今天，其他可以自行切换
    const today = weekdays[0];
    const aniList = data[today] || [];
    const filtered = aniList.filter((ani) => !clearedIds.has(getAniId(ani)));

    return (
        <div className="App">
            <h1>
                {today} 更新番剧 共 {aniList.length} 部
            </h1>
            <div className="ani-list">
                {filtered.map((ani) => (
                    <AniItem
                        key={getAniId(ani)}
                        ani={ani}
                        onClear={handleClear}
                    />
                ))}
            </div>
        </div>
    );
}
