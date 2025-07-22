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

/**
 * 判断两个标题是否相似
 * @param a
 * @param b
 */
export function isSimilarTitle(a: string, b: string): boolean {
    return a.includes(b) || b.includes(a);
}

/**
 * 合并多个 Ani 分组数据
 * @param successList
 */
export function mergeAniGroups(successList: Record<string, Ani[]>[]): Record<string, Ani[]> {
    return successList.reduce<Record<string, Ani[]>>((acc, cur) => {
        Object.entries(cur).forEach(([week, list]) => {
            // 合并当前周的数据
            const combined = (acc[week] || []).concat(list);
            // 最终结果数组
            const result: Ani[] = [];

            for (const item of combined) {
                // 查找 result 中是否有相似的 title
                const conflictIndex = result.findIndex(existing =>
                    isSimilarTitle(existing.title, item.title)
                );
                // 如果没有相似的 title，则直接添加
                if (conflictIndex === -1) {
                    result.push(item);
                } else {
                    // 如果有相似的 title，则比较长度，保留更长的标题
                    const existing = result[conflictIndex];
                    if (item.title.length > existing.title.length) {
                        result[conflictIndex] = item;
                    }
                }
            }

            acc[week] = result;
        });

        return acc;
    }, {});
}

