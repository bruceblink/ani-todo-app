import './App.css';
import { useState } from 'react';
import { type Ani } from './components/AniItem';
import Header from './components/Header';
import AniList from './components/AniList';
import { useAniData } from './hooks/useAniData';
import { getAniId } from './utils/utils';
import RefreshButton from './components/RefreshButton';

export default function App() {
    const { data, loading, error, refresh } = useAniData();

    // 清除机制
    const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('clearedAni');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const handleClear = (id: string) => {
        setClearedIds(prev => {
            const next = new Set(prev);
            next.add(id);
            localStorage.setItem('clearedAni', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    if (loading)   return <div className="App">加载中…</div>;
    if (error)     return <div className="App">出错了：{error}</div>;
    if (!Object.keys(data).length) return <div className="App">无数据</div>;

    const today = Object.keys(data)[0];
    const aniList = data[today] as Ani[];
    const filtered = aniList.filter(a => !clearedIds.has(getAniId(a)));

    return (
        <div className="App">
            {/* 固定在右上角的刷新按钮 */}
            <RefreshButton loading={loading} onClick={refresh} />

            {/* 只显示标题和总数 */}
            <Header weekday={today} total={aniList.length} />

            {/* 番剧列表 */}
            <AniList list={filtered} clearedIds={clearedIds} onClear={handleClear} />
        </div>
    );
}
