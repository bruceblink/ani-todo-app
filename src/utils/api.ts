import {invoke as _invoke} from "@tauri-apps/api/core";


/** 后端返回的统一响应格式 */
export interface ApiResponse<T = unknown> {
    status: 'ok' | 'error'
    message?: string
    data?: T
}

/** Ani 结构体对应的 TS 接口 */
export interface Ani {
    id: number;
    title: string;
    update_count: string;
    detail_url: string;
    image_url: string;
    update_info: string;
    update_time: number;
    update_time_str: string;
    platform: string;
}

// 动漫历史信息
export interface AniHistoryInfo {
    id: number;
    title: string;
    updateCount: string;
    isWatched: boolean,
    userId: string;
    updateTime: number;
    watchedTime: number;
    platform: string;
}

//动漫观看历史
export interface AniWatchHistory {
    id: number,
    user_id: number,
    ani_item_id: number,
    watched_time: string,
}

// 定义所有 抓取数据的命令的类型
export type FetchCmd =
    | 'fetch_bilibili_ani_data'
    | 'fetch_iqiyi_ani_data'
    | 'fetch_qq_ani_data'
    | 'fetch_youku_ani_data'
    | 'fetch_agedm_ani_data'


/** 抓取命令的签名映射 */
type FetchCommandsMap = {
    [K in FetchCmd]: {
        args: { url: string }
        result: Record<string, Ani[]>
    }
}

// 数据源描述
type DataSource = {
    name: string;
    url?: string;
    cmd: FetchCmd;
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
export type ApiCommands = FetchCommandsMap & {
    query_today_update_ani_list: {
        args: undefined
        result: Record<string, Ani[]>
    }
    save_ani_item_data: {
        args: { aniData?: Record<string, Ani[]> }
        result: { message: string }
    }
    query_watched_ani_item_list: {
        args: undefined
        result: AniWatchHistory[]
    }
    watch_ani_item: {
        args: { aniId: number }
        result: { message: string }
    }
    query_favorite_ani_update_list: {
        args: undefined
        result: Ani[]
    }
    collect_ani_item: {
        args: { aniId: number; aniTitle: string }
        result: { message: string }
    }
    cancel_collect_ani_item: {
        args: { aniId: number; aniTitle: string }
        result: { message: string }
    }
    query_ani_history_list: {
        args: {
            page: number;       // 当前页
            pageSize: number;   // 每页大小
        }
        result: {
            total: number;        // 总条数
            items: AniHistoryInfo[];  // 当前页数据数组
        }
    }
}

/**
 * 通用的 invokeApi 函数：
 *  - 先调用 invoke<ApiResponse<T>>
 *  - 根据 status 解包 data 或抛出 Error
 */
export async function invokeApi<K extends keyof ApiCommands>(
    cmd: K,
    args: ApiCommands[K]['args']
): Promise<ApiCommands[K]['result']> {
    const res = await _invoke<ApiResponse<ApiCommands[K]['result']>>(cmd as string, args)
    if (res.status === 'ok') {
        // data 一定存在，否则后端逻辑有误
        return res.data as ApiCommands[K]['result']
    } else {
        // 业务错误，统一抛出
        throw new Error(res.message ?? 'Unknown error')
    }
}

/**
 * 语义化的 API 调用封装，供项目中直接使用
 */
export const api = {
    /**
     * 动态抓取任意数据源
     * @param cmd 必须是 FetchCmd 之一
     * @param url 该源对应的请求 URL
     */
    fetchAniData: (cmd: FetchCmd, url: string) =>
        invokeApi(cmd, { url }),
    /**
     * 获取今日更新的动漫列表
     * */
    queryTodayUpdateAniList: () =>
        invokeApi('query_today_update_ani_list', undefined),
    /**
     * 保存动画数据
     * */
    saveAniItems: (aniData: Record<string, Ani[]>) =>
        invokeApi('save_ani_item_data', {aniData}),
    /**
     * 查询已观看的动画 ID 列表
     * */
    queryWatchedAniIds: () =>
        invokeApi('query_watched_ani_item_list', undefined),
    /**
     * 清除动漫(标记为已看)
     * */
    clearAni: (aniId: number) =>
        invokeApi('watch_ani_item', {aniId}),
    /**
     * 查询关注动漫今日更新的动画列表
     * */
    queryFavoriteUpdateAniList: () =>
        invokeApi('query_favorite_ani_update_list', undefined),
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

    /**
     * 查询动漫历史列表
     */
    queryAniHistoryList: ( params: {
        page: number;
        pageSize: number;
    }) =>
        invokeApi('query_ani_history_list', params),
}
