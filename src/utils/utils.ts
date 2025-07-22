import {invoke} from '@tauri-apps/api/core';
import type {Ani} from "@/utils/api";
/**
 *  从各个视频网站获取最新的动漫更新数据
 * @param url
 * @param cmd
 */
export async function fetchAniData(url: string, cmd: string) {
    try {
        // 调用命令，拿到 JSON 字符串
        const data = await invoke(cmd, { url }) as Record<string, Ani[]>;
        console.log(`fetch data from ${url}：`, data);
        return data;
    } catch (e) {
        console.error(`fetch data from ${url} 失败：`, e);
        return {};
    }
}
