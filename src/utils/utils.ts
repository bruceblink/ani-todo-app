import type {Ani} from "../components/AniItem";
import {invoke} from '@tauri-apps/api/core';

export function getAniId(ani: Ani): string {
    return `${ani.title}-${ani.image_url}`;
}

export async function loadAniData(url: string, cmd: string) {
    try {
        // 调用命令，拿到 JSON 字符串
        const jsonStr = await invoke<string>(cmd, { url });
        // 解析成对象
        const data = JSON.parse(jsonStr);
        console.log('拿到的数据：', data);
        return data;
    } catch (e) {
        console.error('fetchAniData 失败', e);
        throw e;
    }
}