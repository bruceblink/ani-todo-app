import type {Ani} from "../components/AniItem";
import {invoke} from '@tauri-apps/api/core';

export function getAniId(ani: Ani): string {
    return `${ani.title}---${ani.platform}---${ani.update_count}`;
}

/**
 *  从各个视频网站获取最新的动漫更新数据
 * @param url
 * @param cmd
 */
export async function fetchAniData(url: string, cmd: string) {
    try {
        // 调用命令，拿到 JSON 字符串
        const jsonStr = await invoke<string>(cmd, { url });
        // 解析成对象
        const data = JSON.parse(jsonStr);
        console.log(`fetch data from ${url}：`, data);
        return data;
    } catch (e) {
        console.error(`fetch data from ${url} 失败：`, e);
        return {};
    }
}

/**
 * 持久化动漫数据到数据库
 * @param aniData
 */
export async function saveAniData2Database(aniData: Record<string, Ani[]>) {
    try {
        const jsonString: string = JSON.stringify(aniData)
        // 调用命令，拿到 JSON 字符串
        const jsonStr = await invoke<string>("save_ani_item_data", { aniData: jsonString});
        // 解析成对象
        const data = JSON.parse(jsonStr);
        console.log(`save data ${aniData} to db success!`);
        return data;
    } catch (e) {
        console.error(`save data ${aniData} to db failed：`, e);
        return {};
    }
}

export async function removeAniItemFromDatabase(aniId: number) {
    try {
        const jsonStr = await invoke<string>("remove_ani_item_data", { aniId: aniId});
        // 解析成对象
        const data = JSON.parse(jsonStr);
        console.log(`remove ${aniId} from db success!`);
        return data;
    } catch (e) {
        console.error(`remove ${aniId} from db failed：`, e);
        return {};
    }
}

/**
 * 从数据库加载动漫的数据
 * @param cmd
 */
export async function loadAniData(cmd: string) {
    try {
        // 调用命令，拿到 JSON 字符串
        const jsonStr = await invoke<string>(cmd);
        // 解析成对象
        const data = JSON.parse(jsonStr);
        console.log(`fetch data from ${cmd}：`, data);
        return data;
    } catch (e) {
        console.error(`fetch data from ${cmd} 失败：`, e);
        return {};
    }
}

/**
 *  调用tauri的command函数
 * @param cmd 调用的后端command
 * @param args command所需的参数
 *
 * usage:
 * type Response = { status: string };
 * type Args = { aniTitle: string; platform: string };
 *
 * const res = await invokeCommand<Response, Args>('remove_ani_item_data', {
 *     aniTitle: '凉宫春日的忧郁',
 *     platform: 'B站'
 * });
 *
 *
 */
export async function invokeCommand<T, Args extends Record<string, unknown> = Record<string, unknown>>(
    cmd: string,
    args?: Args
): Promise<T | undefined> {
    try {
        const result = await invoke<T>(cmd, args ?? {}); // args 默认为 {}
        console.log(`invoke cmd ${cmd} args`, args, 'success!');
        return result;
    } catch (e) {
        console.error(`invoke cmd ${cmd} args`, args, 'failed:', e);
        return undefined;
    }
}
