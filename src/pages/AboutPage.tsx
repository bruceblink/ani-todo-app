import {Link} from "react-router-dom";

export default function AboutPage() {

/*    const testData: AniHistoryInfo[] = Array.from({ length: 55 }, (_, i) => ({
        id: i + 1,
        title: `动漫 ${i + 1}`,
        updateCount: Math.floor(Math.random() * 24) + 1,
        updateTime: Date.now() - Math.floor(Math.random() * 1000000000),
        isWatched: Math.random() > 0.5,
        watchedTime: Date.now() - Math.floor(Math.random() * 1000000000),
        platform: ['Bilibili', '腾讯', 'Mikanani'][i % 3],
    }));

    const columns: ColumnDef<AniHistoryInfo>[] = useMemo(() => [
        { accessorKey: 'title', header: '动漫标题', cell: info => info.getValue() },
        { accessorKey: 'updateCount', header: '集数' },
        { accessorKey: 'updateTime', header: '更新日期', cell: info => new Date(info.getValue() as number).toLocaleDateString() },
        { accessorKey: 'isWatched', header: '观看状态', cell: info => info.getValue() ? '已观看' : '未观看' },
        { accessorKey: 'watchedTime', header: '观看时间', cell: info => new Date(info.getValue() as number).toLocaleString() },
        { accessorKey: 'platform', header: '播出平台' },
    ], []);*/

    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2>关于本应用</h2>
            <p>这是一个用于追踪新番的应用，基于 React、Tailwind CSS、 Vite + Tauri 构建。</p>
            {/*<CustomizedDataGrid rows={testData} columns={columns} />*/}
            <Link to="/">返回主页</Link>
        </div>
    )
}