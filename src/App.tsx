import './App.css';
import ani_data from './data/ani_data.json';
import AniItem, {type Ani} from "./components/AniItem.tsx";

// 1. 定义整个 JSON 数据的类型（任意星期 → Ani 数组）
type AniData = Record<string, Ani[]>;

// 2. 将导入的 JSON 断言为 AniData
const data = ani_data as AniData;

export default function App() {
    // 3. 获取第一个 key（比如 "星期五"）
    const today = Object.keys(data)[0];

    return (
        <div className="App">
            <h1>{today} 更新番剧</h1>
            <div className="ani-list">
                {data[today].map((ani, idx) => (
                    // 4. 使用 map 遍历数组，渲染每个 AniItem
                    <AniItem ani={ani} idx={idx}/>
                    )
                  )
                }
            </div>
        </div>
    );
}
