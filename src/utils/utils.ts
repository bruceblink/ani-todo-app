import type {Ani} from "../components/AniItem";
import {invoke} from '@tauri-apps/api/core';

export function getAniId(ani: Ani): string {
    return `${ani.title}---${ani.platform}---${ani.update_count}`;
}

export async function loadAniData(url: string, cmd: string) {
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

export async function saveLoadedAniData2Database(aniData: Record<string, Ani[]>) {
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

export async function removeAniItemFromDatabase(aniId: string) {
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