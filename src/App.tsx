import './App.css';
import Header from './components/Header';
import AniList from './components/AniList';
import { useAniData } from './hooks/useAniData';
import RefreshButton from './components/RefreshButton';
import {Toaster} from "react-hot-toast";
import type {Ani} from "@/utils/api";

export default function App() {
    const { data, loading, error, refresh } = useAniData();

    if (loading)   return <div className="App">加载中…</div>;
    if (error)     return <div className="App">出错了：{error}</div>;
    if (!Object.keys(data).length) return <div className="App">无数据</div>;

    const today = Object.keys(data)[0];
    const aniList = data[today] as Ani[];

    return (
        <>
            {/* 显示标题和总数和已观看数目 */}
            <Header weekday={today} total={aniList.length} />
            {/* 固定在右上角的刷新按钮 */}
            <RefreshButton loading={loading} onClick={refresh} />
            <div className="App">

                {/* 番剧列表 */}
                <AniList list={aniList} />
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
