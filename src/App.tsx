import './App.css';
import { useState } from 'react';
import { type Ani } from './components/AniItem';
import Header from './components/Header';
import AniList from './components/AniList';
import { useAniData } from './hooks/useAniData';
import {getAniId, removeAniItemFromDatabase} from './utils/utils';
import RefreshButton from './components/RefreshButton';
import {Toaster} from "react-hot-toast";

export default function App() {
    const { data, loading, error, refresh } = useAniData();

    // 清除机制
    const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('clearedAni');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const handleClear = (id: string) => {
        void removeAniItemFromDatabase(id);
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
        <>
            {/* 显示标题和总数和已观看数目 */}
            <Header weekday={today} total={aniList.length} watched={aniList.length - filtered.length}/>
            {/* 固定在右上角的刷新按钮 */}
            <RefreshButton loading={loading} onClick={refresh} />
            <div className="App">

                {/* 番剧列表 */}
                <AniList list={filtered} clearedIds={clearedIds} onClear={handleClear} />
            </div>
            <Toaster
                position="top-center"
                toastOptions={{
                    className:
                        'bg-gray-50 dark:bg-slate-600 dark:text-white rounded-md shadow-md',
                }}
            />
        </>

    );
}
