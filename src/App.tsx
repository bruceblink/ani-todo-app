import './App.css';
import ani_data from './data/ani_data.json';
import AniItem, {type Ani} from "./components/AniItem.tsx";
import {useState} from "react";
import {getAniId} from "./utils/utils.ts";

// 1. 定义整个 JSON 数据的类型（任意星期 → Ani 数组）
type AniData = Record<string, Ani[]>;

// 2. 将导入的 JSON 断言为 AniData
const data = ani_data as AniData;

export default function App() {
    // 3. 获取第一个 key（比如 "星期五"）
    const today = Object.keys(data)[0];
    const ani_list: Ani[] = data[today];
    // 4. 使用 useState 来管理已清除的番剧 ID
    const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
        // 从 localStorage 获取已清除的番剧 ID
        const cleared = localStorage.getItem('clearedAni');
        return cleared ? new Set(JSON.parse(cleared)) : new Set();
    });

    // 5. 过滤出未清除的番剧
    const filtered = ani_list.filter(ani => !clearedIds.has(getAniId(ani)));

    const handleClear = (id: string) => {
        setClearedIds(prev => {
            // 更新已清除的番剧 ID，并存储到 localStorage
            const newSet = new Set(prev);
            newSet.add(id);
            localStorage.setItem('clearedAni', JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    };


    return (
        <div className="App">
            <h1>{today} 更新番剧 {ani_list.length} 部</h1>
            <div className="ani-list">
                {filtered.map((ani) => (
                    <AniItem ani={ani} onClear={handleClear} key={getAniId(ani)}/>
                ))}
            </div>
        </div>
    );
}
