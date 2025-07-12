import './App.css'
import ani_data from './data/ani_data.json'; // 假设你将数据存储在一个 JSON 文件中

export default function App() {
    const ani_list = ani_data["星期五"].map((ani, idx) => (
        <div className="ani-item" key={`${ani.detail_url}-${idx}`}>
            <a href={ani.detail_url} target="_blank" rel="noopener noreferrer">
                <img className="ani-img" src={ani.image_url} alt={ani.title} />
            </a>
            <div className="ani-info">
                <div className="ani-title">{ani.title}</div>
                <div className="ani-update-info">{ani.update_info}</div>
                <div className="ani-platform">{ani.platform}</div>
            </div>
        </div>
    ));

    const today = Object.keys(ani_data)[0];

    return (
        <div className="App">
            <h1>{today} 更新番剧</h1>
            <div className="ani-list">{ani_list}</div>
        </div>
    );
}


