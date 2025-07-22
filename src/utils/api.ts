
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


export interface AniCollect {
    id: number,
    ani_item_id: number,
    collect_time: string,
    watched: boolean,
}

/**
 * 定义所有 Tauri 命令的签名映射
 * key：命令名；
 * args：前端传参类型；
 * result：命令返回的类型
 */
export interface ApiCommands {
    query_ani_item_data_list: {
        args: { filter?: string }
        result: Record<string, Ani[]>
    },
    save_ani_item_data: {
        args: { aniData?: Record<string, Ani[]> }
        result: Record<string, string>
    },
    get_watched_ani_item_list: {
        args: {filter?: string}
        result: Ani[]
    },
    remove_ani_item_data : {
        args: { aniId?: number }
        result: Record<string, string>
    },
    get_favorite_ani_item_list: {
        args: { filter?: string  }
        result: AniCollect[]
    }
    collect_ani_item : {
        args: { aniId?: number }
        result: Record<string, string>
    },
    cancel_collect_ani_item: {
        args: { aniId?: number }
        result: Record<string, string>
    }
}

/**
 * 通用的 invokeApi 函数
 * @param cmd Tauri 命令名（必须为 ApiCommands 的 key）
 * @param args 对应命令的参数
 * @returns 对应命令的返回值
 */
export async function invokeApi<K extends keyof ApiCommands>(
    cmd: K,
    args: ApiCommands[K]['args']
): Promise<ApiCommands[K]['result']> {
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
    /** 获取动画列表，可选过滤 */
    queryAniList: () =>
        invokeApi('query_ani_item_data_list', {  }),

    saveAniItems: (aniData: Record<string, Ani[]>) =>
        invokeApi('save_ani_item_data', {  aniData }),

    queryWatchedAniIds: () =>
        invokeApi('get_watched_ani_item_list', { }),

    clearAni: (aniId: number) =>
        invokeApi('remove_ani_item_data', { aniId}),

    queryFavoriteAniList: () =>
        invokeApi('get_favorite_ani_item_list', { }),

    collectAni: (aniId: number) =>
        invokeApi('collect_ani_item', { aniId }),

    cancelCollectAni: (aniId: number) =>
        invokeApi('cancel_collect_ani_item', { aniId }),
}
