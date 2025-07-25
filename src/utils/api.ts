
import {invoke} from "@tauri-apps/api/core";
// 1. 定义所有命令的签名映射
//   key：Tauri 命令名
//   value.args：前端调用时传给命令的参数类型
//   value.result：命令返回给前端的数据类型

/**
 * 后端返回的 Ani 结构体对应的 TypeScript 接口
 */
export interface Ani {
    id: number;
    title: string;
    update_count: string;
    detail_url: string;
    image_url: string;
    update_info: string;
    update_time: string;
    platform: string;
}

// 动漫收藏
export interface AniCollect {
    id: number,
    ani_item_id: number,
    ani_title: string,
    collect_time: string,
    is_watched: boolean,
}

//动漫观看历史
export interface AniWatchHistory {
    id: number,
    user_id: number,
    ani_item_id: number,
    watched_time: string,
}

// 数据源描述
type DataSource = {
    name: string;
    url?: string;
    cmd: string;
};

/**
 * 定义所有获取动漫数据的数据源
 */
export const dataSources: DataSource[] = [
    {
        name: '哔哩哔哩国创',
        url: 'https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6',
        cmd: 'fetch_bilibili_ani_data',
    },
    {
        name: '哔哩哔哩番剧',
        url: 'https://api.bilibili.com/pgc/web/timeline?types=1&before=6&after=6',
        cmd: 'fetch_bilibili_ani_data',
    },
    {
        name: '爱奇艺动漫',
        url: 'https://mesh.if.iqiyi.com/portal/lw/v7/channel/cartoon',
        cmd: 'fetch_iqiyi_ani_data',
    },
    /*                {
                        name: '蜜柑计划',
                        url: 'https://mikanani.me',
                        cmd: 'fetch_mikanani_ani_data',
                    },*/
    {
        name: '腾讯视频',
        url: 'https://v.qq.com/channel/cartoon',
        cmd: 'fetch_qq_ani_data',
    },
    {
        name: '优酷视频',
        url: 'https://www.youku.com/ku/webcomic',
        cmd: 'fetch_youku_ani_data',
    },
    {
        name: 'AGE动漫',
        url: 'https://www.agedm.vip/update',
        cmd: 'fetch_agedm_ani_data'
    },
    // ...其他接口
];

/**
 * 定义所有 Tauri 命令的签名映射
 * key：命令名；
 * args：前端传参类型；
 * result：命令返回的类型
 */
export interface ApiCommands {
    fetch_ani_data: {
        args: { url?: string }
        result: Record<string, Ani[]>
    }
    query_today_update_ani_list: {
        args: { filter?: string }
        result: Record<string, Ani[]>
    },
    save_ani_item_data: {
        args: { aniData?: Record<string, Ani[]> }
        result: Record<string, string>
    },
    query_watched_ani_item_list: {
        args: {filter?: string}
        result: AniWatchHistory[]
    },
    watch_ani_item : {
        args: { aniId?: number }
        result: Record<string, string>
    },
    query_favorite_ani_update_list: {
        args: { filter?: string  }
        result: Ani[]
    }
    collect_ani_item : {
        args: { aniId?: number, aniTitle: string }
        result: Record<string, string>
    },
    cancel_collect_ani_item: {
        args: { aniId?: number, aniTitle: string }
        result: Record<string, string>
    },

    update_collected_ani_item: {
        args: { aniId?: number, aniTitle: string }
        result: Record<string, string>
    },
}

/**
 * 通用的 invokeApi 函数
 * @param cmd Tauri 命令名（必须为 ApiCommands 的 key）
 * @param args 对应命令的参数
 * @returns 对应命令的返回值
 */
export async function invokeApi<K extends keyof ApiCommands>(
    cmd: K | string,
    args: ApiCommands[K]["args"]
): Promise<ApiCommands[K]["result"]> {
    try {
        // 只用一个泛型指定返回值类型，命令名由 K 保证安全
        return await invoke<ApiCommands[K]['result']>(cmd, args)
    } catch (e) {
        console.error(`invokeApi ${String(cmd)} failed:`, e)
        throw e
    }
}

/**
 * 语义化的 API 调用封装，供项目中直接使用
 */
export const api = {
    /**
     * 获取指定源的动画数据
     * @param cmd 命令名
     * @param url 可选的 URL 参数
     * */
    fetchAniData: (cmd: string, url: string) =>
        invokeApi(cmd, { url }),
    /**
     * 获取今日更新的动漫列表
     * */
    queryTodayUpdateAniList: () =>
        invokeApi('query_today_update_ani_list', {}),
    /**
     * 保存动画数据
     * */
    saveAniItems: (aniData: Record<string, Ani[]>) =>
        invokeApi('save_ani_item_data', {aniData}),
    /**
     * 查询已观看的动画 ID 列表
     * */
    queryWatchedAniIds: () =>
        invokeApi('query_watched_ani_item_list', {}),
    /**
     * 清除动漫(标记为已看)
     * */
    clearAni: (aniId: number) =>
        invokeApi('watch_ani_item', {aniId}),
    /**
     * 查询关注动漫今日更新的动画列表
     * */
    queryFavoriteUpdateAniList: () =>
        invokeApi('query_favorite_ani_update_list', {}),
    /**
     * 收藏动漫
     */
    collectAni: (aniId: number, aniTitle: string) =>
        invokeApi('collect_ani_item', {aniId, aniTitle}),
    /**
     * 取消收藏动漫
     * */
    cancelCollectAni: (aniId: number, aniTitle: string) =>
        invokeApi('cancel_collect_ani_item', {aniId, aniTitle}),

    updateCollectedAni: (aniId: number, aniTitle: string) =>
        invokeApi('update_collected_ani_item', {aniId, aniTitle}),
}
