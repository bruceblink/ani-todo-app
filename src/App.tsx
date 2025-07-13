// src/App.tsx
import './App.css';
import AniItem, { type Ani } from "./components/AniItem";
import { useState, useEffect } from "react";
import { getAniId, loadAniData } from "./utils/utils";

export default function App() {
    // 1. state：保存后端返回的整个 JSON 数据
    const [data, setData] = useState<Record<string, Ani[]> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // 2. state：管理已清除的番剧 id
    const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('clearedAni');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // 3. 首次渲染时拉取数据
    useEffect(() => {
        (async () => {
            try {
                const aniData = await loadAniData("https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6", "fetch_bilibili_ani_data");
                setData(aniData);
            } catch (e: any) {
                console.error("loadAniData failed", e);
                setError(e.message || "未知错误");
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    const handleClear = (id: string) => {
        setClearedIds(prev => {
            const next = new Set(prev).add(id);
            localStorage.setItem('clearedAni', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    // 4. 渲染逻辑
    if (loading) {
        return <div className="App">加载中…</div>;
    }
    if (error) {
        return <div className="App">出错了：{error}</div>;
    }
    if (!data) {
        return <div className="App">无数据</div>;
    }

    // 假设取第一个 key 作为 today
    const today = Object.keys(data)[0];
    const aniList = data[today] || [];
    // 过滤已清除的
    const filtered = aniList.filter(ani => !clearedIds.has(getAniId(ani)));

    return (
        <div className="App">
            <h1>{today} 更新番剧 共 {aniList.length} 部</h1>
            <div className="ani-list">
                {filtered.map(ani => (
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
