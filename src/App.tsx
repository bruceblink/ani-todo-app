import './App.css';
import ani_data from './data/ani_data.json';
import AniImage from './components/AniImage';

// 1. 定义番剧项的接口
interface Ani {
    title: string;
    detail_url: string;
    image_url: string;
    update_info: string;
    platform: string;
}

// 2. 定义整个 JSON 数据的类型（任意星期 → Ani 数组）
type AniData = Record<string, Ani[]>;

// 3. 将导入的 JSON 断言为 AniData
const data = ani_data as AniData;

export default function App() {
    // 4. 获取第一个 key（比如 "星期五"）
    const today = Object.keys(data)[0];

    return (
        <div className="App">
            <h1>{today} 更新番剧</h1>
            <div className="ani-list">
                {data[today].map((ani, idx) => (
                    <div
                        className="ani-item"
                        key={`${ani.detail_url}-${idx}`}
                        style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
                    >
                        <a href={ani.detail_url} target="_blank" rel="noopener noreferrer">
                            <AniImage
                                url={ani.image_url}
                                alt={ani.title}
                                className="ani-img"
                            />
                        </a>
                        <div className="ani-info">
                            <div className="ani-title">{ani.title}</div>
                            <div className="ani-update-info">{ani.update_info}</div>
                            <div className="ani-platform">{ani.platform}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
