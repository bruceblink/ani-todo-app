import './App.css';
import AniItem, { type Ani } from './components/AniItem';
import { useState, useEffect } from 'react';
import { getAniId, loadAniData } from './utils/utils';

type Source = {
    url: string;
    cmd: string;
};

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
                // 不同的源和命令
                const sources: Source[] = [
                    {
                        url: 'https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6',  //哔哩哔哩国创
                        cmd: 'fetch_bilibili_ani_data',
                    },
                    {
                        url: 'https://api.bilibili.com/pgc/web/timeline?types=1&before=6&after=6',  //哔哩哔哩番剧
                        cmd: 'fetch_bilibili_ani_data',
                    },
                    // 继续添加更多 { url, cmd } 对
                ];

                // 并行发请求
                const results = await Promise.all(
                    sources.map(({ url, cmd }) =>
                        // loadAniData 返回 Promise<Record<string, Ani[]>>
                        loadAniData(url, cmd) as Promise<Record<string, Ani[]>>
                    )
                );

                // 合并
                const merged = results.reduce<Record<string, Ani[]>>((acc, cur) => {
                    (Object.entries(cur) as [string, Ani[]][]).forEach(
                        ([weekday, list]) => {
                            if (!acc[weekday]) acc[weekday] = [];
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
